import React from "react";
import { UseData } from "./hooks/useData";
import { Table } from "react-bootstrap";
import * as XLSX from "xlsx/xlsx.mjs";
import { StudentSignup } from "./types/StudentSignup";
import * as moment from "moment";

type Props = {
  downloadCallback: () => void;
} & UseData;

export const Summary: React.FC<Props> = ({ assignments, downloadCallback }) => {
  const exportGroupedByClass = () => {
    const groupedByClassList: {
      [key: string]: Array<{
        signup: StudentSignup;
        project: string;
        projectId: number;
      }>;
    } = {};

    for (const { project, studentSignups } of assignments) {
      for (const studentSignup of studentSignups) {
        const { linkedStudent } = studentSignup;
        if (!linkedStudent) continue;

        if (!groupedByClassList[linkedStudent.className]) {
          groupedByClassList[linkedStudent.className] = [];
        }

        groupedByClassList[linkedStudent.className].push({
          signup: studentSignup,
          project: `Projekt ${project.id} - ${project.title}`,
          projectId: project.id,
        });
      }
    }
    const workbook = XLSX.utils.book_new();

    const sortedClassNames = Object.keys(groupedByClassList).sort();

    for (const className of sortedClassNames) {
      const worksheetData = [
        ["Vorname", "Nachname", "Projekt", "Priorität"],
        ...groupedByClassList[className].map(
          ({ signup, project, projectId }) => [
            signup.linkedStudent?.firstName,
            signup.linkedStudent?.lastName,
            project,
            signup.projectsPriority.findIndex((p) => p.id === projectId) + 1,
          ]
        ),
      ];

      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

      // Make the column headers bold
      const headerRange = XLSX.utils.decode_range("A3:C3");
      for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
        const cell = worksheet[XLSX.utils.encode_cell({ r: 2, c: C })];
        if (cell) {
          cell.s = { font: { bold: true } };
        }
      }

      // Make the class name title bold and larger
      const titleCell = worksheet["A1"];
      if (titleCell) {
        titleCell.s = { font: { bold: true, sz: 14 } };
      }

      // Adjust column widths
      const colWidths = worksheetData[2].map((_, colIndex) =>
        Math.max(
          ...worksheetData.map((row) =>
            row[colIndex] ? row[colIndex].toString().length : 10
          )
        )
      );
      worksheet["!cols"] = colWidths.map((width) => ({ wch: width }));

      XLSX.utils.book_append_sheet(workbook, worksheet, className);
    }

    XLSX.writeFile(
      workbook,
      `${moment().format("DD-MM-YYYY-HH-MM")}_Projektwoche_Klassenlisten.xlsx`
    );

    downloadCallback();
  };

  const exportGroupedByProject = () => {
    const workbook = XLSX.utils.book_new();

    const groupedByProjectList: {
      [key: string]: Array<{
        signup: StudentSignup;
        project: string;
        projectId: number;
      }>;
    } = {};

    for (const { project, studentSignups } of assignments) {
      if (!groupedByProjectList[project.id]) {
        groupedByProjectList[project.id] = [];
      }

      for (const studentSignup of studentSignups) {
        groupedByProjectList[project.id].push({
          signup: studentSignup,
          project: `Projekt ${project.id} - ${project.title}`,
          projectId: project.id,
        });
      }
    }

    for (const projectId in groupedByProjectList) {
      const worksheetData = [
        ["Klasse", "Vorname", "Nachname", "Projekt", "Priorität"],
        ...groupedByProjectList[projectId].map(
          ({ signup, project, projectId: pId }) => [
            signup.linkedStudent?.className,
            signup.linkedStudent?.firstName,
            signup.linkedStudent?.lastName,
            project,
            signup.projectsPriority.findIndex((p) => p.id === pId) + 1,
          ]
        ),
      ];

      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

      // Make the column headers bold
      const headerRange = XLSX.utils.decode_range("A3:D3");
      for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
        const cell = worksheet[XLSX.utils.encode_cell({ r: 2, c: C })];
        if (cell) {
          cell.s = { font: { bold: true } };
        }
      }

      // Adjust column widths
      if (worksheetData[2]) {
        const colWidths = worksheetData[2].map((_, colIndex) =>
          Math.max(
            ...worksheetData.map((row) =>
              row[colIndex] ? row[colIndex].toString().length : 10
            )
          )
        );
        worksheet["!cols"] = colWidths.map((width) => ({ wch: width }));
      }

      XLSX.utils.book_append_sheet(workbook, worksheet, `Projekt ${projectId}`);
    }

    XLSX.writeFile(
      workbook,
      `${moment().format("DD-MM-YYYY-HH-MM")}_Projektwoche_Projektlisten.xlsx`
    );

    downloadCallback();
  };

  return (
    <div className="w-100 h-auto d-flex flex-column gap-4">
      <h1>Zusammenfassung</h1>
      <div className="w-100 row mt-3">
        <div className="col-8">
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Projekt</th>
                <th>Teilnehmer</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((assignment) => (
                <tr key={assignment.project.id}>
                  <td className="text-truncate" style={{ maxWidth: "600px" }}>
                    <strong>Projekt {assignment.project.id}</strong> -{" "}
                    {assignment.project.title}
                  </td>
                  <td>
                    {assignment.studentSignups.length} /{" "}
                    {assignment.project.maxParticipants}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
        <div className="col-4 d-flex flex-column gap-3">
          <h2>Resultate exportieren</h2>
          <button
            className="btn btn-success"
            onClick={() => exportGroupedByClass()}
          >
            Nach Klassen eingeteilt <i className="bi bi-download"></i>
          </button>
          <button
            className="btn btn-success"
            onClick={() => exportGroupedByProject()}
          >
            Nach Projekten eingeteilt <i className="bi bi-download"></i>
          </button>
        </div>
      </div>
    </div>
  );
};
