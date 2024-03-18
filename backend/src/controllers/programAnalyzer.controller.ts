import { programAnalyzerService } from "../services/programAnalyzer.service";

const analyzeProgram = async (req: any, res: any, next: any) => {
  try {
    res.json(await programAnalyzerService.analyzeProgram(req.body));
  } catch (err) {
    next(err);
  }
};

export const programAnalyzerController = { analyzeProgram };
