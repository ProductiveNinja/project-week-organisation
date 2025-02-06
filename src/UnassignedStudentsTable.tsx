import React, { useState } from "react";
import { Table } from "react-bootstrap";
import { ProjectAssignment } from "./types/ProjectAssignment";
import { Student } from "./types/Student";
import { CreateAssignmentModal } from "./CreateAssignmentModal.tsx";
import { StudentSignup } from "./types/StudentSignup.ts";
import { getNextFreeId } from "./util.ts";

type Props = {
  missingStudents: Student[];
  signups: StudentSignup[];
  assignments: ProjectAssignment[];
  addSignup: (signup: StudentSignup) => void;
};

export const UnassignedStudentsTable: React.FC<Props> = ({
  missingStudents,
  signups,
  assignments,
  addSignup,
}) => {
  const [assignStudent, setAssignStudent] = useState<Student | null>(null);

  return (
    <div className="d-flex flex-column gap-2">
      {assignStudent && (
        <CreateAssignmentModal
          onClose={() => setAssignStudent(null)}
          student={assignStudent}
          assignments={assignments}
          nextFreeId={getNextFreeId(signups)}
          signupCallback={(signup) => addSignup(signup)}
        />
      )}
      <h3>Fehlende / Unzugewisene Schüler:innen ({missingStudents.length})</h3>
      <div className="w-full">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Klasse</th>
              <th>Name</th>
              <th>Zuweisen</th>
            </tr>
          </thead>
          <tbody>
            {missingStudents.length === 0 && (
              <tr>
                <td colSpan={3}>Keine fehlenden Schüler:innen</td>
              </tr>
            )}
            {missingStudents.map(({ className, firstName, lastName }, i) => (
              <tr key={i}>
                <td>{className}</td>
                <td>
                  {firstName} {lastName}
                </td>
                <td className="d-flex justify-content-center">
                  <button
                    className="btn btn-secondary"
                    onClick={() =>
                      setAssignStudent({ className, firstName, lastName })
                    }
                  >
                    Zuweisen <i className="bi bi-box-arrow-in-down"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
};
