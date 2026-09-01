// CSS module declarations
declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}

// Allow side-effect CSS imports
declare module '*.css?inline' {
  const content: string;
  export default content;
}
