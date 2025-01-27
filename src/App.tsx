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
];

export const App: React.FC = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedStepIndex, setCompletedStepIndex] = useState(0);

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
          <h3>Projektwoche</h3>
          {(projects.length > 0 ||
            students.length > 0 ||
            signups.length > 0) && (
            <button
              className="btn btn-danger"
              onClick={() => deleteCachedData()}
            >
              Gespeicherte Daten löschen
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
                  currentStepIndex === 0
                    ? 1
                    : (currentStepIndex / processSteps.length) * 100
                }%`,
              }}
            ></div>
          </div>
          <div className="row align-items-center my-2 mx-3">
            {processSteps.map((step, i) => (
              <div
                key={i}
                className="col-3 d-flex justify-content-center fw-bold clickable"
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
                renderListItem={({
                  id,
                  email,
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
              <ProjectAssignment {...data} />,
            ][currentStepIndex]
          }
        </main>
      </AlertContext.Provider>
    </div>
  );
};
