import React, { useMemo } from "react";
import {
  OverrideAssignment,
  ProjectAssignment,
} from "./types/ProjectAssignment";
import { StudentSignup } from "./types/StudentSignup";
import { Table } from "react-bootstrap";
import { Modal } from "./Modal.tsx";

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
    <Modal title={`Einteilung von ${studentName} bearbeiten`} onClose={onClose}>
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
                    priority.id === currentPriority?.id ? "text-success" : ""
                  }`}
                >
                  <strong>Priorität {i + 1}:</strong> Projekt {priority.id} -{" "}
                  {priority.title}{" "}
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
    </Modal>
  );
};
