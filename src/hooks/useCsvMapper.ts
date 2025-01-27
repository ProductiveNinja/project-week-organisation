import { Project } from "../types/Project";
import { Student } from "../types/Student";
import { StudentSignup } from "../types/StudentSignup";
import * as moment from "moment";

export const useCSVMapper = () => {
  const mapProjectRow = (row: any[]): Project | null => {
    if (!row[2]) return null;

    return {
      id: parseInt(row[0]),
      title: row[1],
      maxParticipants: parseInt(row[2]),
    };
  };

  const mapStudentRow = (row: any[]): Student | null => {
    if (!row[2]) return null;
    return {
      className: row[0],
      firstName: row[1],
      lastName: row[2],
    };
  };

  const mapSignupRow = (row: any[]): StudentSignup | null => {
    if (!row[6]) return null;

    const projectsPriority = row[6].split(";").map((project) => {
      const match = project.match(/Projekt (\d+) - (.+)/);
      return {
        id: match ? parseInt(match[1]) : 0,
        title: match ? match[2] : "",
        maxParticipants: 0,
      };
    });

    return {
      id: parseInt(row[0]),
      createdAt: moment(row[1], "DD/MM/YYYY HH:mm:ss").toDate(),
      finishedAt: moment(row[2], "DD/MM/YYYY HH:mm:ss").toDate(),
      email: row[3],
      name: row[4],
      updatedAt: row[5]
        ? moment(row[5], "DD/MM/YYYY HH:mm:ss").toDate()
        : undefined,
      projectsPriority,
    };
  };

  return {
    mapProjectRow,
    mapStudentRow,
    mapSignupRow,
  };
};
