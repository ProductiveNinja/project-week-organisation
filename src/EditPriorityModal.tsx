import React from "react";
import { StudentSignup } from "./types/StudentSignup";
import { Project } from "./types/Project";
import { Dropdown, DropdownButton } from "react-bootstrap";
import { Modal } from "./Modal.tsx";

type Props = {
  signup: StudentSignup;
  priorityIndex: number;
  projects: Project[];
  projectPriorityCallback: (project: Project) => void;
  onClose: () => void;
};

export const EditPriorityModal: React.FC<Props> = ({
  signup,
  priorityIndex,
  projects,
  projectPriorityCallback,
  onClose,
}) => {
  return (
    <Modal
      title={`Priorität ${priorityIndex + 1} von ${signup.name} bearbeiten`}
      onClose={onClose}
    >
      <DropdownButton
        title="Priorität auswählen"
        variant="transparent"
        onSelect={(eventKey) => {
          const selectedProject = projects.find(
            (project) => project.id.toString() === eventKey
          );
          if (!selectedProject) return;

          projectPriorityCallback(selectedProject);
          onClose();
        }}
      >
        {projects.map((project, i) => (
          <Dropdown.Item
            key={i}
            eventKey={project.id.toString()}
            disabled={signup.projectsPriority.some((p) => p.id === project.id)}
          >
            Projekt {project.id} - {project.title}
          </Dropdown.Item>
        ))}
      </DropdownButton>
    </Modal>
  );
};
