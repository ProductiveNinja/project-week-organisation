import React, { useEffect, useState } from "react";
import { UseData } from "./hooks/useData";
import { ProjectAssignment as Assignment } from "./types/ProjectAssignment.ts";
import * as moment from "moment";
import { ProjectAssignmentTable } from "./ProjectAssignmentTable.tsx";
import { StudentSignup } from "./types/StudentSignup.ts";
import { EditAssigmentModal } from "./EditAssigmentModal.tsx";
import { OverrideAssignmentTable } from "./OverrideAssignmentTable.tsx";

type Props = {
  continueCallback: () => void;
} & UseData;

export const ProjectAssignment: React.FC<Props> = ({
  projects,
  signups,
  assignments,
  setAssignments,
  overrideAssigments,
  setOverrideAssigments,
  continueCallback,
}) => {
  const [selectedAssigmentIndex, setSelectedAssignmentIndex] = useState(0);
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

  return (
    <div className="w-100 h-auto d-flex flex-column gap-4">
      <div className="row">
        <div className="col-6">
          <h2>Projekteinteilung</h2>
          <div className="w-100 d-flex justify-content-start align-items-center gap-2 mt-3">
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
              disabled={selectedAssigmentIndex === assignments.length - 1}
              onClick={() =>
                setSelectedAssignmentIndex(
                  Math.min(selectedAssigmentIndex + 1, assignments.length - 1)
                )
              }
            >
              Nächstes Projekt
            </button>
            <p>
              ({selectedAssigmentIndex + 1} / {assignments.length})
            </p>
            <button className="btn btn-primary" onClick={continueCallback}>
              Weiter
            </button>
          </div>
          <div className="w-100 mt-3">
            {assignments[selectedAssigmentIndex] && (
              <ProjectAssignmentTable
                assignment={assignments[selectedAssigmentIndex]}
                editCallback={(signup) => setEditSignup(signup)}
              />
            )}
          </div>
          {editSignup !== null && (
            <EditAssigmentModal
              onClose={() => setEditSignup(null)}
              editCallback={(overrideAssigment) =>
                setOverrideAssigments((prev) => [
                  ...prev.filter(
                    ({ signupId }) => signupId !== overrideAssigment.signupId
                  ),
                  overrideAssigment,
                ])
              }
              projectAssigments={assignments}
              signup={editSignup}
            />
          )}
        </div>
        <div className="col-6" style={{ marginTop: "126.5px" }}>
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
