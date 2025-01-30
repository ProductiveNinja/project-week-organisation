import React from "react";
import { Table } from "react-bootstrap";
import CSVReader from "react-csv-reader";
import { toStaticFileUrl } from "./util.ts";

type Props = {
  title: string;
  tableTitle: string;
  tableHeaders: string[];
  exampleCsvFile: string;
  hint: string | React.ReactNode;
  items: any[];
  setItems: (items: any[]) => void;
  renderListItem: (item: any) => React.ReactNode;
  itemMapCallback: (item: any) => any;
  continueCallback: () => void;
};

export const CSVImporter: React.FC<Props> = ({
  title,
  tableTitle,
  tableHeaders,
  exampleCsvFile,
  hint,
  items,
  setItems,
  renderListItem,
  itemMapCallback,
  continueCallback,
}) => {
  const handleImport = (data: any[][]) => {
    const newItems = data
      .slice(1)
      .map((row) => {
        return itemMapCallback(row);
      })
      .filter(Boolean) as any[];

    setItems(newItems);
  };

  const downloadExampleCsv = () => {
    const link = document.createElement("a");
    link.setAttribute("href", toStaticFileUrl(exampleCsvFile));
    link.setAttribute("download", exampleCsvFile);

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  };

  return (
    <div className="w-100 h-auto d-flex flex-column gap-4">
      <h1>{title}</h1>
      <div className="row gap-3">
        <div className="col-12 d-flex align-items-start gap-3">
          <CSVReader
            cssClass="csv-reader-input"
            onFileLoaded={(data) => handleImport(data)}
          />
          {items.length > 0 && (
            <button className="btn btn-primary" onClick={continueCallback}>
              Weiter
            </button>
          )}
          <button
            className="btn btn-secondary"
            onClick={() => downloadExampleCsv()}
          >
            Beispieldatei herunterladen{" "}
            <i className="bi bi-download"></i>
          </button>
        </div>
        <div className="col-12">
          {typeof hint === "string" ? (
            <p className="text-muted">{hint}</p>
          ) : (
            hint
          )}
        </div>
      </div>

      <div className="w-100 d-flex flex-column gap-2">
        <h2>
          {tableTitle} ({items.length})
        </h2>
        <Table striped bordered hover>
          <thead>
            <tr>
              {tableHeaders.map((header, i) => (
                <th key={i}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i}>{renderListItem(item)}</tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
};
