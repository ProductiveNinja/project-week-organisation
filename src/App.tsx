import React, { useEffect, useState } from "react";
import "./App.css";
import { AlertContext } from "./contexts/alertContext.ts";
import { useAlert } from "./hooks/useAlert.ts";
import { CSVImporter } from "./CSVImporter.tsx";
import { Project } from "./types/Project.ts";
import { useCSVMapper } from "./hooks/useCsvMapper.ts";
import { useData } from "./hooks/useData.ts";
import { Student } from "./types/Student.ts";
import { ProjectAssignment } from "./ProjectAssignment.tsx";
import { Summary } from "./Summary.tsx";

type ProcessStep = {
  title: string;
};

const processSteps: ProcessStep[] = [
  {
    title: "Projekte",
  },
  {
    title: "Schüler:innen",
  },
  {
    title: "Anmeldungen",
  },
  {
    title: "Projekteinteilung",
  },
  {
    title: "Zusammenfassung",
  },
];

export const App: React.FC = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedStepIndex, setCompletedStepIndex] = useState(0);
  const [processCompleted, setProcessCompleted] = useState(false);

  const useAlertHook = useAlert();
  const { alert, setAlert } = useAlertHook;

  const { mapProjectRow, mapStudentRow, mapSignupRow } = useCSVMapper();
  const data = useData(setAlert);
  const {
    projects,
    setProjects,
    deleteProjects,
    students,
    setStudents,
    deleteStudents,
    signups,
    setSignups,
    deleteSignups,
    deleteAssignments,
    deleteOverrideAssigments,
  } = data;

  const deleteCachedData = () => {
    deleteProjects();
    deleteStudents();
    deleteSignups();
    deleteAssignments();
    deleteOverrideAssigments();

    setAlert({
      message: "Daten erfolgreich gelöscht",
      type: "success",
    });
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  useEffect(() => {
    if (currentStepIndex > completedStepIndex) {
      setCompletedStepIndex(currentStepIndex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStepIndex]);

  return (
    <div className="w-100 h-100">
      <AlertContext.Provider value={useAlertHook}>
        <nav className="w-full d-flex justify-content-between align-items-center px-3 gap-3">
          <h3>Projektwoche planen</h3>
          {(projects.length > 0 ||
            students.length > 0 ||
            signups.length > 0) && (
            <button
              className="btn btn-danger"
              onClick={() => deleteCachedData()}
            >
              Lokal gespeicherte Daten löschen
            </button>
          )}
        </nav>
        <div className="w-full mb-4">
          <div className="progress mx-3">
            <div
              className="progress-bar progress-bar-striped"
              role="progressbar"
              style={{
                width: `${
                  processCompleted
                    ? 100
                    : currentStepIndex === 0
                    ? 1
                    : (currentStepIndex / processSteps.length) * 100
                }%`,
              }}
            ></div>
          </div>
          <div className="d-flex my-2 mx-3">
            {processSteps.map((step, i) => (
              <div
                key={i}
                className="d-flex justify-content-center fw-bold clickable"
                style={{ width: `${100 / processSteps.length}%` }}
                onClick={() => {
                  if (i <= completedStepIndex) setCurrentStepIndex(i);
                }}
              >
                {step.title}
              </div>
            ))}
          </div>
        </div>
        <main className="mx-4">
          <div className="position-fixed bottom-0 end-0 m-3">
            {alert && (
              <div className={`alert alert-${alert.type}`} role="alert">
                {alert.message}
              </div>
            )}
          </div>
          {
            [
              <CSVImporter
                key="projects"
                title="Projekte importieren"
                tableTitle="Projekte"
                tableHeaders={["Projekt Nr.", "Titel", "Max. Teilnehmer:innen"]}
                exampleCsvFile="projects.csv"
                hint="Es muss eine CSV-Datei hochgeladen werden. Die erste Zeile wird ignoriert. Die Reihenfolge der Spalten ist irrelevant."
                items={projects}
                setItems={(items) => {
                  setProjects(items);
                }}
                renderListItem={(project: Project) => (
                  <>
                    <td>{project.id}</td>
                    <td>{project.title}</td>
                    <td>{project.maxParticipants}</td>
                  </>
                )}
                itemMapCallback={(row) => mapProjectRow(row)}
                continueCallback={() => setCurrentStepIndex((prev) => prev + 1)}
              />,
              <CSVImporter
                key="students"
                title="Schüler:innen importieren"
                tableTitle="Schüler:innen"
                tableHeaders={["Klasse", "Vorname", "Nachname"]}
                items={students}
                setItems={(items) => {
                  setStudents(items);
                }}
                exampleCsvFile="students.csv"
                hint="Es muss eine CSV-Datei hochgeladen werden. Die erste Zeile wird ignoriert. Die Reihenfolge der Spalten ist irrelevant. Weitere Vornamen werden ignoriert. Die Schüler werden anhand von ihrem Vor- und Nachnamen mit den Anmeldungen korrelliert. Stelle sicher, dass diese übereinstimmen. Sonderzeichen wie 
              'äüöéàèê' werden automatisch umgewandelt."
                renderListItem={(student: Student) => (
                  <>
                    <td>{student.className}</td>
                    <td>{student.firstName}</td>
                    <td>{student.lastName}</td>
                  </>
                )}
                itemMapCallback={(row) => mapStudentRow(row)}
                continueCallback={() => setCurrentStepIndex((prev) => prev + 1)}
              />,
              <CSVImporter
                key="signups"
                title={"Anmeldungen importieren"}
                tableTitle="Anmeldungen"
                tableHeaders={[
                  "ID",
                  "Klasse",
                  "Name",
                  ...Array.from({ length: 4 }).map((_, i) => `Prio. ${i + 1}`),
                ]}
                items={signups}
                setItems={(items) => setSignups(items)}
                exampleCsvFile="signups.csv"
                hint={
                  <div className="d-flex">
                    <p className="text-muted">
                      Es muss eine CSV-Datei hochgeladen werden. Die erste Zeile
                      wird ignoriert. Die Reihenfolge der Spalten ist
                      irrelevant. Die Anmeldungen können in diesem Format aus
                      einer Microsoft-Forms umfrage exportiert werden (siehe
                      Screenshot). Jede Antwortmöglichkeit MUSS im Format{" "}
                      <strong>"Projekt (nr) - (Titel)"</strong> sein, ansonsten
                      können die Projekte nicht zugeordnet werden.
                    </p>
                    <img
                      src="/forms-sample.png"
                      alt="Forms Sample"
                      className="clickable"
                      title="In Grossansicht öffnen"
                      onClick={() => window.open("/forms-sample.png")}
                      width={200}
                      height={250}
                    />
                  </div>
                }
                renderListItem={({
                  id,
                  name,
                  linkedStudent,
                  projectsPriority,
                }) => (
                  <>
                    <td>{id}</td>
                    <td>{linkedStudent ? linkedStudent.className : "-"}</td>
                    <td>
                      {linkedStudent
                        ? `${linkedStudent.firstName} ${linkedStudent.lastName}`
                        : name}
                    </td>
                    {projectsPriority.map((project, i) => (
                      <td
                        key={i}
                        className="text-truncate"
                        style={{ maxWidth: 200 }}
                      >
                        {project.title}
                      </td>
                    ))}
                  </>
                )}
                itemMapCallback={(row) => mapSignupRow(row)}
                continueCallback={() => setCurrentStepIndex((prev) => prev + 1)}
              />,
              <ProjectAssignment
                {...data}
                continueCallback={() => setCurrentStepIndex((prev) => prev + 1)}
              />,
              <Summary
                {...data}
                downloadCallback={() => setProcessCompleted(true)}
              />,
            ][currentStepIndex]
          }
        </main>
      </AlertContext.Provider>
    </div>
  );
};
