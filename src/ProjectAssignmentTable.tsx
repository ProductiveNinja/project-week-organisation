import React from "react";
import { ProjectAssignment } from "./types/ProjectAssignment";
import { Table } from "react-bootstrap";
import { StudentSignup } from "./types/StudentSignup";

type Props = {
  assignment: ProjectAssignment;
  editCallback: (studentSignup: StudentSignup) => void;
  toggleProjectCancelled: () => void;
};

const priorityIndexColorMap = ["#00FF00", "#FFA500", "#FF7F7F", "#FF0000"];

export const ProjectAssignmentTable: React.FC<Props> = ({
  assignment,
  editCallback,
  toggleProjectCancelled,
}) => {
  if (!assignment.studentSignups) return null;

  return (
    <div
      className="w-100 d-flex flex-column gap-2 mx-auto"
      style={{ maxWidth: "1200px" }}
    >
      <p className="font-italic">
        Projekt {assignment.project.id} ({assignment.studentSignups.length} /{" "}
        {assignment.project.maxParticipants})
      </p>
      <div className="d-flex gap-3">
        <h3
          style={{
            textDecoration: assignment.project.cancelled
              ? "line-through"
              : "none",
          }}
        >
          {assignment.project.title}
        </h3>
        <button className="btn btn-danger" onClick={toggleProjectCancelled}>
          Absagen
        </button>
      </div>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Anmeldung #</th>
            <th>Klasse</th>
            <th>Name</th>
            <th>Prio #</th>
            <th className="text-center">
              <i className="bi bi-pencil"></i>
            </th>
          </tr>
        </thead>
        <tbody>
          {assignment.studentSignups.length === 0 && (
            <tr>
              <td colSpan={5}>Keine Anmeldungen</td>
            </tr>
          )}
          {assignment.studentSignups.map((signup) => {
            const { id, linkedStudent, name, projectsPriority } = signup;
            const priorityIndex = projectsPriority.findIndex(
              (p) => p.id === assignment.project.id
            );
            return (
              <tr key={id}>
                <td>{id}</td>
                <td>{linkedStudent ? linkedStudent.className : "-"}</td>
                <td>
                  {linkedStudent
                    ? `${linkedStudent.firstName} ${linkedStudent.lastName}`
                    : name}
                </td>
                <td
                  style={{
                    backgroundColor: priorityIndexColorMap[priorityIndex],
                  }}
                >
                  {priorityIndex + 1}
                </td>
                <td className="d-flex justify-content-center">
                  <button
                    className="btn btn-primary d-flex align-items-center gap-2"
                    onClick={() => editCallback(signup)}
                  >
                    Einteilung bearbeiten
                    <i className="bi bi-pencil"></i>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
};
