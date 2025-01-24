import fs from "fs";
import path from "path";
import { ProblemDefinitionParser } from "./ProblemDefinitionGenerator";
import { FullProblemDefinitionParser } from "./FullProblemDefinitionGenerator";

function generatePartialBoilerplate(generatorFilePath: string) {
  const inputFilePath = path.join(__dirname, generatorFilePath, "Structure.md");
  const boilerplatePath = path.join(
    __dirname,
    generatorFilePath,
    "boilerplate"
  );

  // Read the input file
  const input = fs.readFileSync(inputFilePath, "utf-8");

  // Parse the input
  const parser = new ProblemDefinitionParser();
  parser.parse(input);

  // Generate the boilerplate code
  const cppCode = parser.generateCpp();
  const jsCode = parser.generateJs();
//   const rustCode = parser.generateRust();
  const pythonCode = parser.generatePython();

  // Ensure the boilerplate directory exists
  if (!fs.existsSync(boilerplatePath)) {
    fs.mkdirSync(boilerplatePath, { recursive: true });
  }

  // Write the boilerplate code to respective files
  fs.writeFileSync(path.join(boilerplatePath, "function.cpp"), cppCode);
  fs.writeFileSync(path.join(boilerplatePath, "function.js"), jsCode);
//   fs.writeFileSync(path.join(boilerplatePath, "function.rs"), rustCode);
  fs.writeFileSync(path.join(boilerplatePath, "function.py"), pythonCode);

  console.log("Boilerplate code generated successfully!");
}


function generateFullBoilerPLate(generatorFilePath: string) {
    const inputFilePath = path.join(__dirname, generatorFilePath, "Structure.md");
    const boilerplatePath = path.join(
      __dirname,
      generatorFilePath,
      "boilerplate-full",
    );
  
    // Read the input file
    const input = fs.readFileSync(inputFilePath, "utf-8");
  
    // Parse the input
    const parser = new FullProblemDefinitionParser();
    parser.parse(input);
  
    // Generate the boilerplate code
    const cppCode = parser.generateCpp();
    const jsCode = parser.generateJs();
    // const rustCode = parser.generateRust();
    const pythonCode = parser.generatePython();
  
    // Ensure the boilerplate directory exists
    if (!fs.existsSync(boilerplatePath)) {
      fs.mkdirSync(boilerplatePath, { recursive: true });
    }
  
    // Write the boilerplate code to respective files
    fs.writeFileSync(path.join(boilerplatePath, "function.cpp"), cppCode);
    fs.writeFileSync(path.join(boilerplatePath, "function.js"), jsCode);
    // fs.writeFileSync(path.join(boilerplatePath, "function.rs"), rustCode);
    fs.writeFileSync(path.join(boilerplatePath, "function.py"), pythonCode);
  
    console.log("Boilerplate code generated successfully!");
}
  
  generatePartialBoilerplate(process.env.GENERATOR_FILE_PATH ?? "");
  generateFullBoilerPLate(process.env.GENERATOR_FILE_PATH ?? "");
  