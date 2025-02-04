import React from "react";

export type ModalProps = {
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  minWidth?: number;
};

export const Modal: React.FC<ModalProps> = ({
  onClose,
  title,
  minWidth = 800,
  children,
  footer,
}) => {
  return (
    <div
      className="modal show d-flex justify-content-center align-items-center"
      style={{ backgroundColor: "#000000AD" }}
    >
      <div className="modal-dialog" style={{ minWidth: `${minWidth}px` }}>
        <div className="modal-content">
          <div className="modal-header d-flex justify-content-between align-items-center">
            <h5 className="modal-title">{title}</h5>
            <button
              className="btn btn-transparent"
              data-dismiss="modal"
              aria-label="Close"
              onClick={() => {
                onClose();
              }}
            >
              <span aria-hidden="true">
                <i className="bi bi-x-lg"></i>
              </span>
            </button>
          </div>
          <div className="modal-body d-flex flex-column gap-3">{children}</div>
          {footer && <div className="modal-footer">{footer}</div>}
        </div>
      </div>
    </div>
  );
};
