import cors from "cors";
import express from "express";
import ts from "typescript";
import { init } from "z3-solver";
import { ProgramAnalyzer } from "./classes/ProgramAnalyzer";
import programAnalyzerRouter from "./routes/programAnalyzer.router";

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.get("/", async (req, res) => {
  await testZ3();
  res.send("Hello World!");
});

app.use("/analyzeProgram", programAnalyzerRouter);

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});

const testZ3 = async () => {
  const { Context } = await init();
  const { Solver, Int, And } = Context("main");

  const x = Int.const("x");

  const solver = new Solver();
  solver.add(And(x.ge(0), x.le(9)));
  console.log(await solver.check());
  console.log("finished z3");
};

const testAnalyze = async () => {
  const source = `
    function test(a: number,b: number) {
      const x = 1;
      const y =2;
      if (a > b) {
        return 1;
      } 
      else {
        return 2;
      }
    }
    const w = 1;
    const p = 2;
    test(w,p);

  `;

  const sourceFile = ts.createSourceFile(
    "file",
    source,
    ts.ScriptTarget.ES2020,
    true
  );

  const programAnalyzer = new ProgramAnalyzer();
  const analyzerNotes = await programAnalyzer.analyze(sourceFile);
  return analyzerNotes;
};
testAnalyze();
