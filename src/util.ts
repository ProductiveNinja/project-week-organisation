export const toStaticFileUrl = (path: string) => {
  return `/project-week-organisation/${path}`;
};

export const normalizeName = (name: string) => {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/gi, "")
    .toLowerCase();
};

export const getNextFreeId = <T extends { id: number }>(arr: T[]): number => {
  const ids = arr.map((item) => item.id);
  return Math.max(...ids, 0) + 1;
};
