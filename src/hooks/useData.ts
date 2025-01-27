import { useEffect } from "react";
import { StudentSignup } from "../types/StudentSignup.ts";
import { Student } from "../types/Student.ts";
import { Project } from "../types/Project.ts";
import {
  OverrideAssignment,
  ProjectAssignment,
} from "../types/ProjectAssignment.ts";
import { UseAlert } from "./useAlert.ts";
import { useLocalStorageValue } from "./useLocalStorageValue.ts";

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
    const normalizeName = (name: string) => {
      return name
        .split(" ")[0]
        .replace(/[^a-z0-9]/gi, "")
        .toLowerCase();
    };

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

  return {
    projects,
    setProjects,
    deleteProjects,
    students,
    setStudents,
    deleteStudents,
    signups,
    setSignups,
    deleteSignups,
    assignments,
    setAssignments,
    deleteAssignments,
    overrideAssigments,
    setOverrideAssigments,
    deleteOverrideAssigments,
  };
};

export type UseData = ReturnType<typeof useData>;
