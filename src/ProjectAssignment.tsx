import React, { useEffect, useMemo, useState } from "react";
import { UseData } from "./hooks/useData";
import { ProjectAssignment as Assignment } from "./types/ProjectAssignment.ts";
import * as moment from "moment";
import { ProjectAssignmentTable } from "./ProjectAssignmentTable.tsx";
import { StudentSignup } from "./types/StudentSignup.ts";
import { EditAssigmentModal } from "./EditAssigmentModal.tsx";
import { OverrideAssignmentTable } from "./OverrideAssignmentTable.tsx";
import { UnassignedStudentsTable } from "./UnassignedStudentsTable.tsx";

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
}) => {
  const [selectedAssigmentIndex, setSelectedAssignmentIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [editSignup, setEditSignup] = useState<StudentSignup | null>(null);

  const assignProjects = () => {
    const sortedSignups = [...signups].sort(
      (a, b) =>
        moment(a.createdAt).toDate().getTime() -
        moment(b.createdAt).toDate().getTime()
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
  }, [projects, signups, overrideAssigments]);

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

  return (
    <div className="w-100 h-auto d-flex flex-column gap-4">
      <div className="row">
        <div className="col-6">
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
                  placeholder="Search..."
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
        <div className="col-6" style={{ marginTop: "139px" }}>
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
          <OverrideAssignmentTable
            signups={signups}
            projects={projects}
            overrideAssignments={overrideAssigments}
            setOverrideAssignments={setOverrideAssigments}
          />
        </div>
      </div>
    </div>
  );
};
