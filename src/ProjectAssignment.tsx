import React, { useEffect, useMemo, useState } from "react";
import { generateSeed, UseData } from "./hooks/useData.ts";
import { ProjectAssignment as Assignment } from "./types/ProjectAssignment.ts";
import { ProjectAssignmentTable } from "./ProjectAssignmentTable.tsx";
import { StudentSignup } from "./types/StudentSignup.ts";
import { EditAssigmentModal } from "./EditAssigmentModal.tsx";
import { OverrideAssignmentTable } from "./OverrideAssignmentTable.tsx";
import { UnassignedStudentsTable } from "./UnassignedStudentsTable.tsx";
import * as chance from "chance";

type Props = {
  continueCallback: () => void;
} & UseData;

export const ProjectAssignment: React.FC<Props> = ({
  projects,
  signups,
  setSignups,
  missingStudents,
  assignments,
  setAssignments,
  overrideAssigments,
  setOverrideAssigments,
  continueCallback,
  shuffleSeed,
  setShuffleSeed,
}) => {
  const [selectedAssigmentIndex, setSelectedAssignmentIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [editSignup, setEditSignup] = useState<StudentSignup | null>(null);

  const assignProjects = () => {
    const chanceInstance = chance(shuffleSeed);

    const sortedSignups = [...signups].sort(() =>
      chanceInstance.bool() ? -1 : 1
    );

    const projectAssignments: Assignment[] = projects.map((project) => ({
      project,
      studentSignups: [],
    }));

    overrideAssigments.forEach(({ projectId, signupId }) => {
      const projectAssignment = projectAssignments.find(
        (pa) => pa.project.id === projectId
      );

      const signup = signups.find((s) => s.id === signupId);

      if (projectAssignment && signup) {
        projectAssignment.studentSignups.push(signup);
      }
    });

    sortedSignups
      .filter(
        (signup) =>
          !overrideAssigments.some(({ signupId }) => signup.id === signupId)
      )
      .forEach((signup) => {
        for (const priorityProject of signup.projectsPriority) {
          const projectAssignment = projectAssignments.find(
            (pa) => pa.project.id === priorityProject.id
          );

          if (
            projectAssignment &&
            projectAssignment.studentSignups.length <
              projectAssignment.project.maxParticipants
          ) {
            projectAssignment.studentSignups.push(signup);
            break;
          }
        }
      });

    setAssignments(projectAssignments);
  };

  useEffect(() => {
    assignProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects, signups, overrideAssigments, shuffleSeed]);

  const filteredAssignments = useMemo(() => {
    if (!searchQuery.trim().length) return assignments;

    setSelectedAssignmentIndex(0);
    return assignments
      .map((assignment) => ({
        ...assignment,
        studentSignups: assignment.studentSignups.filter((signup) =>
          signup.name
            .toLowerCase()
            .trim()
            .includes(searchQuery.toLowerCase().trim())
        ),
      }))
      .filter((assignment) => assignment.studentSignups.length > 0);
  }, [searchQuery, assignments, setSelectedAssignmentIndex]);

  const countByPriority = useMemo(() => {
    const countByPriority: number[] = [0, 0, 0, 0];
    filteredAssignments.forEach((assignment) => {
      assignment.studentSignups.forEach((signup) => {
        const priorityIndex = signup.projectsPriority.findIndex(
          (p) => p.id === assignment.project.id
        );
        countByPriority[priorityIndex]++;
      });
    });

    return countByPriority;
  }, [filteredAssignments]);

  return (
    <div className="w-100 h-auto d-flex flex-column gap-4">
      <div className="row">
        <div className="col-7">
          <h2>Projekteinteilung</h2>
          <div
            className="w-100 d-flex justify-conte
          nt-start align-items-start gap-2 mt-3"
          >
            <div className="d-flex align-items-center gap-2">
              <button
                className="btn btn-light"
                disabled={selectedAssigmentIndex === 0}
                onClick={() =>
                  setSelectedAssignmentIndex(
                    Math.max(selectedAssigmentIndex - 1, 0)
                  )
                }
              >
                Vorheriges Projekt
              </button>
              <button
                className="btn btn-light"
                disabled={
                  selectedAssigmentIndex === filteredAssignments.length - 1
                }
                onClick={() =>
                  setSelectedAssignmentIndex(
                    Math.min(
                      selectedAssigmentIndex + 1,
                      filteredAssignments.length - 1
                    )
                  )
                }
              >
                Nächstes Projekt
              </button>
              <p>
                ({selectedAssigmentIndex + 1} / {filteredAssignments.length})
              </p>
            </div>
            <div className="input-group" style={{ maxWidth: "180px" }}>
              <div className=" d-flex flex-column gap-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Suchen ..."
                  aria-label="Search"
                  style={{ maxWidth: "180px" }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.currentTarget.value)}
                />
                {searchQuery.trim().length > 0 && (
                  <p>
                    {
                      filteredAssignments.flatMap(
                        ({ studentSignups }) => studentSignups
                      ).length
                    }{" "}
                    Treffer in {filteredAssignments.length} Projekten
                  </p>
                )}
              </div>
            </div>
            <button className="btn btn-primary" onClick={continueCallback}>
              Weiter
            </button>
          </div>
          <div className="w-100 mt-3">
            <div>
              <p className="fw-bold">Anzahl nach Priorität</p>
              <ul className="d-block">
                {countByPriority.map((count, i) => (
                  <li key={i}>
                    <p>
                      <strong>Prio. {i + 1}: </strong>
                      {count}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="w-100 mt-3">
            {filteredAssignments[selectedAssigmentIndex] && (
              <ProjectAssignmentTable
                assignment={filteredAssignments[selectedAssigmentIndex]}
                editCallback={(signup) => setEditSignup(signup)}
              />
            )}
          </div>
          {editSignup !== null && (
            <EditAssigmentModal
              onClose={() => setEditSignup(null)}
              editCallback={(overrideAssignment) =>
                setOverrideAssigments((prev) => [
                  ...prev.filter(
                    ({ signupId }) => signupId !== overrideAssignment.signupId
                  ),
                  overrideAssignment,
                ])
              }
              projectAssigments={assignments}
              signup={editSignup}
            />
          )}
        </div>
        <div className="col-5">
          <p className="text-muted mt-5">
            Die Schüler:innen werden zufällig gemischt bevor sie in die Projekte
            zugeteilt werden. Dies wird Anhande eines Seeds durchgeführt:
          </p>
          <div className="d-flex gap-2" style={{ marginBottom: "142.5px" }}>
            <input type="text" value={shuffleSeed} readOnly disabled />
            <button
              className="btn btn-secondary"
              onClick={() => setShuffleSeed(generateSeed())}
            >
              Neuen Seed generieren
            </button>
          </div>
          <OverrideAssignmentTable
            signups={signups}
            projects={projects}
            overrideAssignments={overrideAssigments}
            setOverrideAssignments={setOverrideAssigments}
          />
          <UnassignedStudentsTable
            missingStudents={missingStudents}
            signups={signups}
            assignments={assignments}
            addSignup={(signup) => {
              console.log(signup);
              setSignups((prev) => [
                ...prev.filter(({ id }) => id !== signup.id),
                signup,
              ]);
            }}
          />
        </div>
      </div>
    </div>
  );
};
