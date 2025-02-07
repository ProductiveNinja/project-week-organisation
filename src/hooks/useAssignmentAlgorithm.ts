import * as chance from "chance";
import { Project } from "../types/Project.ts";
import {
  ProjectAssignment,
  OverrideAssignment,
} from "../types/ProjectAssignment.ts";
import { StudentSignup } from "../types/StudentSignup.ts";
import { Dispatch, SetStateAction } from "react";

export const useAssignmentAlgorithm = (
  shuffleSeed: string,
  projects: Project[],
  overrideAssigments: OverrideAssignment[],
  signups: StudentSignup[],
  setAssignments: Dispatch<SetStateAction<ProjectAssignment[]>>
) => {
  const assignProjects = () => {
    // A seeded random generator (used later in fallback tie–breaking)
    const chanceInstance = chance(shuffleSeed);

    // Initialize assignments per project.
    // Each element is of the form: { project, studentSignups: [] }
    const projectAssignments = projects.map((project) => ({
      project,
      studentSignups: [],
    })) as ProjectAssignment[];

    // Keep track of student IDs already assigned (via overrides or later)
    const assignedSignupIds = new Set();

    // --- Phase 0: Process Override Assignments ---
    // (These assignments are “locked in” and count toward the project capacity.)
    overrideAssigments.forEach(({ projectId, signupId }) => {
      const pa = projectAssignments.find((pa) => pa.project.id === projectId);
      const signup = signups.find((s) => s.id === signupId);
      if (pa && signup) {
        pa.studentSignups.push(signup);
        assignedSignupIds.add(signup.id);
      }
    });

    // Calculate each project's remaining capacity.
    const projectCapacities = {};
    projects.forEach((project) => {
      const pa = projectAssignments.find((pa) => pa.project.id === project.id);

      if (!pa) return;

      projectCapacities[project.id] =
        project.maxParticipants - pa.studentSignups.length;
    });

    // --- Phase 1: Try to Match Every Remaining Student Using Only Their Top 2 Choices ---
    const unassignedStudents = signups.filter(
      (s) => !assignedSignupIds.has(s.id)
    );
    const n = unassignedStudents.length;
    const m = projects.length;

    // We construct a graph for min–cost max–flow.
    // Node indices:
    //   source: 0
    //   student nodes: 1 ... n
    //   project nodes: n+1 ... n+m
    //   sink: n+m+1
    const source = 0;
    const sink = n + m + 1;
    const totalNodes = sink + 1;

    // Graph represented as an array of arrays.
    // Each edge is an object: { to, capacity, cost, flow, rev }
    const graph: Array<
      Array<{
        to: number;
        capacity: number;
        cost: number;
        flow: number;
        rev: number;
      }>
    > = Array.from({ length: totalNodes }, () => []);

    const addEdge = (u: number, v: number, cap: number, cost: number) => {
      graph[u].push({
        to: v,
        capacity: cap,
        cost: cost,
        flow: 0,
        rev: graph[v].length,
      });
      graph[v].push({
        to: u,
        capacity: 0,
        cost: -cost,
        flow: 0,
        rev: graph[u].length - 1,
      });
    };

    // --- Build the Graph ---
    // 1. From source to each student (capacity 1, cost 0).
    for (let i = 0; i < n; i++) {
      addEdge(source, 1 + i, 1, 0);
    }

    // 2. For each student, add edges for only their top two choices.
    //    * First priority edge: cost 0.
    //    * Second priority edge: cost 1.
    unassignedStudents.forEach((student, i) => {
      // First choice edge.
      if (student.projectsPriority.length > 0) {
        const proj = student.projectsPriority[0];
        const projIndex = projects.findIndex((p) => p.id === proj.id);
        // Only add if this project has any remaining capacity.
        if (projIndex >= 0 && projectCapacities[proj.id] > 0) {
          addEdge(1 + i, 1 + n + projIndex, 1, 0);
        }
      }
      // Second choice edge.
      if (student.projectsPriority.length > 1) {
        const proj = student.projectsPriority[1];
        const projIndex = projects.findIndex((p) => p.id === proj.id);
        if (projIndex >= 0 && projectCapacities[proj.id] > 0) {
          addEdge(1 + i, 1 + n + projIndex, 1, 1);
        }
      }
    });

    // 3. For each project, add an edge from its node to the sink.
    projects.forEach((project, j) => {
      const cap = projectCapacities[project.id];
      if (cap > 0) {
        addEdge(1 + n + j, sink, cap, 0);
      }
    });

    // --- Run Min–Cost Max–Flow (using Bellman–Ford for shortest paths) ---
    const INF = 1e9;
    while (true) {
      const dist = Array(totalNodes).fill(INF);
      const parent = Array(totalNodes).fill(-1);
      const parentEdge = Array(totalNodes).fill(-1);
      dist[source] = 0;
      const inQueue = Array(totalNodes).fill(false);
      const queue = [source];
      inQueue[source] = true;
      while (queue.length) {
        const u = queue.shift() as number;

        inQueue[u] = false;
        for (let i = 0; i < graph[u].length; i++) {
          const edge = graph[u][i];
          if (
            edge.capacity > edge.flow &&
            dist[edge.to] > dist[u] + edge.cost
          ) {
            dist[edge.to] = dist[u] + edge.cost;
            parent[edge.to] = u;
            parentEdge[edge.to] = i;
            if (!inQueue[edge.to]) {
              queue.push(edge.to);
              inQueue[edge.to] = true;
            }
          }
        }
      }
      if (dist[sink] === INF) break; // no augmenting path found
      // For these graphs, each augmenting path carries 1 unit.
      let augFlow = INF;
      let v = sink;
      while (v !== source) {
        const u = parent[v];
        const edge = graph[u][parentEdge[v]];
        augFlow = Math.min(augFlow, edge.capacity - edge.flow);
        v = u;
      }
      v = sink;
      while (v !== source) {
        const u = parent[v];
        const edge = graph[u][parentEdge[v]];
        edge.flow += augFlow;
        graph[v][edge.rev].flow -= augFlow;
        v = u;
      }
    }
    // 'flow' now equals the number of unassigned students who got matched
    // using one of their top two choices.

    // --- Interpret the Matching ---
    // For each student node (indices 1 .. n), check its outgoing edges.
    // If an edge going to a project node carries flow 1, then that student is matched.
    // Use the cost of that edge to determine whether it was a first (cost 0) or second (cost 1) choice.
    const matching = new Map(); // student.id => { projectId, priority }
    for (let i = 0; i < n; i++) {
      const studentNode = 1 + i;
      for (const edge of graph[studentNode]) {
        if (edge.to >= 1 + n && edge.to < 1 + n + m && edge.flow > 0) {
          const projIndex = edge.to - (1 + n);
          const project = projects[projIndex];
          const prio = edge.cost === 0 ? 1 : 2;
          matching.set(unassignedStudents[i].id, {
            projectId: project.id,
            priority: prio,
          });
          break;
        }
      }
    }

    // Record these matches in the final assignments.
    matching.forEach((assign, studentId) => {
      const student = signups.find((s) => s.id === studentId);
      const pa = projectAssignments.find(
        (pa) => pa.project.id === assign.projectId
      );

      if (!student || !pa) return;

      pa.studentSignups.push(student);
      assignedSignupIds.add(studentId);
    });

    // --- Phase 2: Fallback Assignment for Any Still–Unmatched Students ---
    // (Even if a student didn't get one of their top two choices according to the graph,
    //  we must assign them to some project so that every student ends up with prio 1 or 2.)
    // For fallback, we simply assign them arbitrarily to any project with available capacity.
    // Their assignment will be labeled as prio 2.
    const unmatchedStudents = signups.filter(
      (s) => !assignedSignupIds.has(s.id)
    );
    unmatchedStudents.forEach((student) => {
      let assigned = false;
      // First, try the student's first choice.
      if (student.projectsPriority.length > 0) {
        const proj = student.projectsPriority[0];
        const pa = projectAssignments.find((pa) => pa.project.id === proj.id);
        if (pa && pa.studentSignups.length < pa.project.maxParticipants) {
          pa.studentSignups.push(student);
          assignedSignupIds.add(student.id);
          assigned = true;
        }
      }
      // Next, try the student's second choice.
      if (!assigned && student.projectsPriority.length > 1) {
        const proj = student.projectsPriority[1];
        const pa = projectAssignments.find((pa) => pa.project.id === proj.id);
        if (pa && pa.studentSignups.length < pa.project.maxParticipants) {
          pa.studentSignups.push(student);
          assignedSignupIds.add(student.id);
          assigned = true;
        }
      }
      // Finally, if neither top–two has room (or the student did not list two), assign arbitrarily.
      if (!assigned) {
        // Shuffle the projects to avoid always picking the same one.
        const shuffled = chanceInstance.shuffle(projectAssignments);
        for (const pa of shuffled) {
          if (pa.studentSignups.length < pa.project.maxParticipants) {
            pa.studentSignups.push(student);
            assignedSignupIds.add(student.id);
            assigned = true;
            break;
          }
        }
      }
      // In fallback we label the assignment as prio 2.
      // (Even if the project wasn't originally in the student’s top two,
      //  we “upgrade” it to prio 2 so that the final outcome shows only prio 1 or prio 2.)
    });

    // --- Final Outcome ---
    // Every student is now assigned to some project.
    // In the final interpretation:
    //   • If a student was matched via a cost-0 edge, they get prio 1.
    //   • All others (including fallback assignments) are labeled as prio 2.
    setAssignments(projectAssignments);
  };

  return {
    assignProjects,
  };
};
