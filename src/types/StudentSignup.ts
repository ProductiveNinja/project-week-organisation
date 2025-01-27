import { Project } from "./Project";
import { Student } from "./Student";

export type StudentSignup = {
  id: number;
  createdAt: Date;
  finishedAt: Date;
  email: string;
  name: string;
  projectsPriority: Project[];
  updatedAt?: Date;
  linkedStudent?: Student;
};
