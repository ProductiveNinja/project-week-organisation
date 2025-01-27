import React from "react";
import { Table } from "react-bootstrap";
import CSVReader from "react-csv-reader";

type Props = {
  title: string;
  tableTitle: string;
  tableHeaders: string[];
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

  return (
    <div className="w-100 h-auto d-flex flex-column gap-4">
      <h1>{title}</h1>
      <div className="d-flex justify-content-start align-items-center gap-3">
        <CSVReader
          cssClass="csv-reader-input"
          onFileLoaded={(data) => handleImport(data)}
        />
        {items.length > 0 && (
          <button className="btn btn-primary" onClick={continueCallback}>
            Weiter
          </button>
        )}
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
