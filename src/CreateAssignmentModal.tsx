import React, { useState } from "react";
import { ProjectAssignment } from "./types/ProjectAssignment";
import { StudentSignup } from "./types/StudentSignup";
import { Student } from "./types/Student";
import { Table } from "react-bootstrap";
import { Project } from "./types/Project";
import { normalizeName } from "./util.ts";

type Props = {
  onClose: () => void;
  assignments: ProjectAssignment[];
  student: Student;
  nextFreeId: number;
  signupCallback: (signup: StudentSignup) => void;
};

export const CreateAssignmentModal: React.FC<Props> = ({
  onClose,
  student,
  assignments,
  nextFreeId,
  signupCallback,
}) => {
  const { className, firstName, lastName } = student;
  const [projectPriorities, setProjectPriorities] = useState<Project[]>([]);

  const getFirstEmailDomain = (): string => {
    if (!assignments[0]?.studentSignups[0]?.email) return "example.com";
    return assignments[0].studentSignups[0].email.split("@")[1];
  };

  const finalizeAssignment = () => {
    const signup: StudentSignup = {
      id: nextFreeId,
      createdAt: new Date(),
      updatedAt: new Date(),
      finishedAt: new Date(),
      email: `${normalizeName(firstName)}.${normalizeName(
        lastName
      )}@${getFirstEmailDomain()}`,
      name: `${firstName} ${lastName}`,
      projectsPriority: projectPriorities,
      linkedStudent: student,
    };

    signupCallback(signup);
    onClose();
  };

  return (
    <div
      className="modal show d-flex justify-content-center align-items-center"
      style={{ backgroundColor: "#000000AD" }}
    >
      <div className="modal-dialog" style={{ minWidth: "800px" }}>
        <div className="modal-content">
          <div className="modal-header d-flex justify-content-between align-items-center">
            <h5 className="modal-title">
              {className} {firstName} {lastName} einteilen
            </h5>
            <button
              className="btn btn-transparent"
              data-dismiss="modal"
              aria-label="Close"
              onClick={onClose}
            >
              <span aria-hidden="true">
                <i className="bi bi-x-lg"></i>
              </span>
            </button>
          </div>
          <div className="modal-body d-flex flex-column gap-3">
            <Table striped bordered hover>
              <tbody>
                {assignments.map(({ project, studentSignups }, i) => {
                  const projectPriorityIndex = projectPriorities.findIndex(
                    (p) => p.id === project.id
                  );

                  return (
                    <tr key={i}>
                      <td
                        className="text-truncate"
                        style={{ maxWidth: "250px" }}
                      >
                        Projekt {project.id} - {project.title}{" "}
                        {project
                          ? `(${
                              project.maxParticipants - studentSignups.length
                            } freie Plätze)`
                          : ""}
                      </td>
                      <td className="d-flex justify-content-center">
                        {projectPriorityIndex !== -1 ? (
                          <div className="d-flex align-items-center gap-2">
                            <p>Priorität {projectPriorityIndex + 1}</p>
                            <button
                              className="btn btn-danger"
                              onClick={() =>
                                setProjectPriorities((prev) =>
                                  prev.filter((p) => p.id !== project.id)
                                )
                              }
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        ) : (
                          <button
                            className="btn btn-primary"
                            onClick={() => {
                              setProjectPriorities((prev) => [
                                ...prev,
                                project,
                              ]);
                            }}
                            disabled={projectPriorities.length === 4}
                          >
                            Als Priorität{" "}
                            {projectPriorities.length === 4
                              ? 4
                              : projectPriorities.length + 1}{" "}
                            wählen
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Abbrechen
            </button>
            <button
              className="btn btn-primary"
              disabled={projectPriorities.length !== 4}
              onClick={() => finalizeAssignment()}
            >
              Einteilung abschliessen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
