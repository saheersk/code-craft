export const LANGUAGE_MAPPING: {
  [key: string]: {
    executor: number;
    internal: number;
    name: string;
    monaco: string;
  };
} = {
  js: { executor: 1, internal: 1, name: "Javascript", monaco: "javascript" },
  cpp: { executor: 2, internal: 2, name: "C++", monaco: "cpp" },
  // rs: { executor: 3, internal: 3, name: "Rust", monaco: "rust" },
  py: { executor: 4, internal: 4, name: "Python", monaco: "python" },
};
