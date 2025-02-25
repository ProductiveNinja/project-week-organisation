import React from "react";
import { Table } from "react-bootstrap";
import { Modal } from "./Modal.tsx";
import { Project } from "./types/Project";
import { StudentSignup } from "./types/StudentSignup";

type Props = {
  changes: Array<[StudentSignup, Project, Project]>;
  onClose: () => void;
};

export const AssignmentChangesModal: React.FC<Props> = ({
  changes,
  onClose,
}) => {
  return (
    <Modal title="Änderungen an Zuweisungen" onClose={onClose}>
      <div className="d-flex flex-column gap-2">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Klasse</th>
              <th>Schüler:in</th>
              <th>Vorheriges Projekt</th>
              <th>Neues Projekt</th>
            </tr>
          </thead>
          <tbody>
            {changes.map(([signup, oldProject, newProject], i) => (
              <tr key={i}>
                <td>{signup.linkedStudent?.className ?? "-"}</td>
                <td>
                  {signup.linkedStudent?.firstName}{" "}
                  {signup.linkedStudent?.lastName}
                </td>
                <td>
                  {oldProject
                    ? `Projekt ${oldProject.id} - ${oldProject.title}`
                    : "-"}
                </td>
                <td>
                  {newProject
                    ? `Projekt ${newProject.id} - ${newProject.title}`
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </Modal>
  );
};
