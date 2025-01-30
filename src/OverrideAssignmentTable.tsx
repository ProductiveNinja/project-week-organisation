import React from "react";
import { Table } from "react-bootstrap";
import { OverrideAssignment } from "./types/ProjectAssignment";
import { Dispatch, SetStateAction } from "react";
import { StudentSignup } from "./types/StudentSignup";
import { Project } from "./types/Project";

type Props = {
  signups: StudentSignup[];
  projects: Project[];
  overrideAssignments: OverrideAssignment[];
  setOverrideAssignments: Dispatch<SetStateAction<OverrideAssignment[]>>;
};

export const OverrideAssignmentTable: React.FC<Props> = ({
  signups,
  projects,
  overrideAssignments,
  setOverrideAssignments,
}) => {
  return (
    <div className="d-flex flex-column gap-2">
      <h3>Manuelle Änderungen</h3>
      <div className="w-full">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Anmeldung #</th>
              <th>Klasse</th>
              <th>Name</th>
              <th>Projekt</th>
              <th className="text-center">
                <i className="bi bi-trash"></i>
              </th>
            </tr>
          </thead>
          <tbody>
            {overrideAssignments.map(({ projectId, signupId }) => {
              const signup = signups.find((s) => s.id === signupId);
              const project = projects.find((p) => p.id === projectId);

              return (
                <tr key={signupId}>
                  <td>{signupId}</td>
                  <td>{signup?.linkedStudent?.className ?? "-"}</td>
                  <td>
                    {signup?.linkedStudent
                      ? `${signup.linkedStudent.firstName} ${signup.linkedStudent.lastName}`
                      : signup?.name}
                  </td>
                  <td className="text-truncate" style={{ maxWidth: "150px" }}>
                    {project ? `Projekt ${project.id} - ${project.title}` : "-"}
                  </td>
                  <td className="d-flex justify-content-center">
                    <button
                      className="btn btn-danger"
                      onClick={() =>
                        setOverrideAssignments((prev) =>
                          prev.filter((oa) => oa.signupId !== signupId)
                        )
                      }
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
    </div>
  );
};
