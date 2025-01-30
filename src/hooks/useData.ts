import { useEffect, useMemo } from "react";
import { StudentSignup } from "../types/StudentSignup.ts";
import { Student } from "../types/Student.ts";
import { Project } from "../types/Project.ts";
import {
  OverrideAssignment,
  ProjectAssignment,
} from "../types/ProjectAssignment.ts";
import { UseAlert } from "./useAlert.ts";
import { useLocalStorageValue } from "./useLocalStorageValue.ts";
import { normalizeName } from "../util.ts";
import * as moment from "moment";

export const useData = (setAlert: UseAlert["setAlert"]) => {
  const [projects, setProjects, deleteProjects] = useLocalStorageValue<
    Project[]
  >("projects", []);

  const [students, setStudents, deleteStudents] = useLocalStorageValue<
    Student[]
  >("students", []);

  const [signups, setSignups, deleteSignups] = useLocalStorageValue<
    StudentSignup[]
  >("signups", []);

  const [assignments, setAssignments, deleteAssignments] = useLocalStorageValue<
    ProjectAssignment[]
  >("assignments", []);

  const [overrideAssigments, setOverrideAssigments, deleteOverrideAssigments] =
    useLocalStorageValue<OverrideAssignment[]>("overrideAssigments", []);

  const linkStudentsToSignups = () => {
    const newSignups = signups.map((signup) => {
      const linkedStudent = students.find(
        (student) =>
          normalizeName(student.firstName) ===
            normalizeName(signup.name.split(" ")[0]) &&
          normalizeName(student.lastName) ===
            normalizeName(signup.name.split(" ")[1])
      );

      return {
        ...signup,
        linkedStudent,
      };
    });

    setAlert({
      message: `${
        newSignups.filter((signup) => signup.linkedStudent).length
      } von ${newSignups.length} Anmeldungen verknüpft`,
      type: "success",
    });

    setSignups(newSignups);
  };

  const missingStudents = useMemo(
    () =>
      students.filter(
        (student) =>
          !signups.find(
            (signup) =>
              signup.linkedStudent?.firstName === student.firstName &&
              signup.linkedStudent?.lastName === student.lastName
          )
      ),
    [signups, students]
  );

  useEffect(() => {
    if (
      !students.length ||
      !signups.length ||
      signups.some((signup) => signup.linkedStudent)
    )
      return;
    linkStudentsToSignups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signups]);

  const downloadData = () => {
    const data = {
      projects,
      students,
      signups,
      overrideAssigments,
    };

    const blob = new Blob([JSON.stringify(data)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${moment().format(
      "DD-MM-YYYY-HH-mm"
    )}_projektwoche_export.json`;
    a.click();

    setAlert({
      message: "Export erfolgreich heruntergeladen",
      type: "success",
    });
  };

  const uploadData = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const text = await file.text();
      const data = JSON.parse(text);

      setProjects(data.projects || []);
      setStudents(data.students || []);
      setSignups(data.signups || []);
      setAssignments(data.assignments || []);
      setOverrideAssigments(data.overrideAssigments || []);

      setAlert({
        message: "Daten erfolgreich geladen",
        type: "success",
      });
    };

    input.click();
  };

  return {
    projects,
    setProjects,
    deleteProjects,
    students,
    setStudents,
    deleteStudents,
    signups,
    missingStudents,
    setSignups,
    deleteSignups,
    assignments,
    setAssignments,
    deleteAssignments,
    overrideAssigments,
    setOverrideAssigments,
    deleteOverrideAssigments,
    linkStudentsToSignups,
    downloadData,
    uploadData,
  };
};

export type UseData = ReturnType<typeof useData>;
