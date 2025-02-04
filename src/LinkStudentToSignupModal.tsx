import React, { useMemo, useState } from "react";
import { Modal } from "./Modal.tsx";
import { StudentSignup } from "./types/StudentSignup";
import { Student } from "./types/Student.ts";
import { Table } from "react-bootstrap";
import { normalizeName } from "./util.ts";

type Props = {
  signup: StudentSignup;
  students: Student[];
  linkCallback: (student: Student) => void;
  onClose: () => void;
};

export const LinkStudentToSignupModal: React.FC<Props> = ({
  signup,
  students,

  linkCallback,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>("");

  const possibleStudents = useMemo(() => {
    if (searchQuery.trim().length) {
      return students.filter(({ firstName, lastName, className }) =>
        [firstName, lastName, className]
          .map((name) => name.toLowerCase())
          .some((name) => name.includes(searchQuery.toLowerCase()))
      );
    }

    return students.filter(({ firstName, lastName }) =>
      signup.name
        .split(" ")
        .map((part) => normalizeName(part.trim().toLowerCase()))
        .some(
          (part) =>
            normalizeName(firstName.toLowerCase()).includes(part) ||
            normalizeName(lastName.toLowerCase()).includes(part)
        )
    );
  }, [students, signup, searchQuery]);

  return (
    <Modal title="Schüler:in der Anmeldung zuteilen" onClose={onClose}>
      <div className="d-flex flex-column gap-2">
        <p className="h5">
          <strong>Name in der Anmeldung:</strong> {signup.name}
        </p>
        <div className="input-group" style={{ maxWidth: "180px" }}>
          <input
            type="text"
            className="form-control"
            placeholder="Suchen..."
            aria-label="Search"
            style={{ maxWidth: "180px" }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
          />
        </div>
        <p className="fw-bold">Mögliche Übereinstimmungen</p>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Klasse</th>
              <th>Vorname</th>
              <th>Nachname</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {possibleStudents.map((student, i) => (
              <tr key={i}>
                <td>{student.className}</td>
                <td>{student.firstName}</td>
                <td>{student.lastName}</td>
                <td>
                  <button
                    className="btn btn-primary"
                    onClick={() => linkCallback(student)}
                  >
                    Zuweisen
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </Modal>
  );
};
