import { Project } from "./Project";
import { StudentSignup } from "./StudentSignup";

export type ProjectAssignment = {
  project: Project;
  studentSignups: StudentSignup[];
};

export type OverrideAssignment = {
  signupId: number;
  projectId: number;
};
