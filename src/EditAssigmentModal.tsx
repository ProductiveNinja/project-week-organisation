import React, { useMemo } from "react";
import {
  OverrideAssignment,
  ProjectAssignment,
} from "./types/ProjectAssignment";
import { StudentSignup } from "./types/StudentSignup";
import { Table } from "react-bootstrap";

type Props = {
  onClose: () => void;
  projectAssigments: ProjectAssignment[];
  signup: StudentSignup;
  editCallback: (overrideAssigment: OverrideAssignment) => void;
};

export const EditAssigmentModal: React.FC<Props> = ({
  onClose,
  projectAssigments,
  signup,
  editCallback,
}) => {
  const { linkedStudent, name, projectsPriority } = signup;

  const currentAssigment = useMemo(() => {
    return projectAssigments.find(({ studentSignups }) =>
      studentSignups.some(({ id }) => id === signup.id)
    );
  }, [projectAssigments, signup]);

  const currentPriority = useMemo(() => {
    return projectsPriority.find((p) => p.id === currentAssigment?.project.id);
  }, [currentAssigment, projectsPriority]);

  const studentName = linkedStudent
    ? `${linkedStudent.firstName} ${linkedStudent.lastName}`
    : name;

  return (
    <div
      className="modal show d-flex justify-content-center align-items-center"
      style={{ backgroundColor: "#000000AD" }}
    >
      <div className="modal-dialog" style={{ minWidth: "800px" }}>
        <div className="modal-content">
          <div className="modal-header d-flex justify-content-between align-items-center">
            <h5 className="modal-title">
              Einteilung von {studentName} bearbeiten
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
            <p>
              <strong>Jetztige Einteilung:</strong>{" "}
              {currentAssigment
                ? `Projekt ${currentAssigment.project.id} - ${currentAssigment.project.title}`
                : "-"}
            </p>

            <Table striped bordered hover>
              <tbody>
                {projectsPriority.map((priority, i) => {
                  const project = projectAssigments.find(
                    ({ project }) => project.id === priority.id
                  );

                  return (
                    <tr key={priority.id}>
                      <td
                        className={`${
                          priority.id === currentPriority?.id
                            ? "text-success"
                            : ""
                        }`}
                      >
                        <strong>Priorität {i + 1}:</strong> Projekt{" "}
                        {priority.id} - {priority.title}{" "}
                        {project
                          ? `(${
                              project.project.maxParticipants -
                              project.studentSignups.length
                            } freie Plätze)`
                          : ""}
                      </td>
                      <td>
                        <button
                          className="btn btn-primary"
                          disabled={priority.id === currentPriority?.id}
                          onClick={() =>
                            editCallback({
                              projectId: priority.id,
                              signupId: signup.id,
                            })
                          }
                        >
                          In dieses Projekt einteilen
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};
