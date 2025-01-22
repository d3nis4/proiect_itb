import express from "express";
import { exec } from "child_process";
import util from "util";
import cors from "cors";
import fs from "fs";
import path from "path";

const execAsync = util.promisify(exec);
const app = express();

const bridgeScriptPath = path.resolve("./bridge.sh"); 


const allowedOrigins = ["http://localhost:5173"]; //permitem doar aplicatiei noastre sa faca cereri
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed"));
      }
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json()); 


app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log("Headers:", req.headers);
  if (Object.keys(req.body).length) {
    console.log("Body:", req.body);
  }
  next();
});


const errorLogger = fs.createWriteStream("server_errors.log", { flags: "a" });
app.use((err, req, res, next) => {
  errorLogger.write(`[${new Date().toISOString()}] ${err.message}\n${err.stack}\n`);
  res.status(500).json({ error: "Internal server error" });
}); //salvam erorile intr un fisier 

function buildCommand(action, params = []) {
  const validActions = ["mint", "burn", "eth"];
  if (!validActions.includes(action)) {
    throw new Error("Invalid action");
  }
  return `bash ${bridgeScriptPath} ${[action, ...params].join(" ")}`;
}
//construim comanda pentru a o trimite la bridge.sh

//aici facem token pe blockchain ,avem adresa sursa, cantiatea si destinatia
//o rulam si afisam un mesaj de eroare sau de succes
app.post("/api/mint", async (req, res) => {
  const { recvAddress, amount, destinationChain } = req.body;

  if (!recvAddress || !amount || !destinationChain) {
    return res.status(400).json({ error: "recvAddress, amount, and destinationChain are required" });
  }

  try {
    const action = destinationChain === "Sui" ? "mint" : destinationChain === "Ethereum" ? "eth" : null;
    if (!action) {
      return res.status(400).json({ error: "Invalid destination chain" });
    }

    const command = buildCommand(action, [amount, recvAddress, destinationChain.toLowerCase()]);
    console.log("Executing command:", command);

    const { stdout, stderr } = await execAsync(command);
    if (stderr) {
      console.error("Command error:", stderr);
      return res.status(500).json({ error: stderr });
    }

    console.log("Command output:", stdout);
    res.json({ message: "Mint operation successful", output: stdout });
  } catch (error) {
    console.error("Error executing mint command:", error);
    res.status(500).json({ error: error.message });
  }
});

// aici dam burn la tokens pe blockchain
//avem qty, adresa utilizatorului si id-ul tokenului
app.post("/api/burn", async (req, res) => {
  const { amount, userAddress, coinObjectId } = req.body;

  if (!amount || !userAddress || !coinObjectId) {
    return res.status(400).json({ error: "amount, userAddress, and coinObjectId are required" });
  }

  try {
    const command = buildCommand("burn", [amount, userAddress, coinObjectId]);
    console.log("Executing command:", command);

    const { stdout, stderr } = await execAsync(command);
    if (stderr) {
      console.error("Command error:", stderr);
      return res.status(500).json({ error: stderr });
    }

    console.log("Command output:", stdout);
    res.json({ message: "Burn operation successful", output: stdout });
  } catch (error) {
    console.error("Error executing burn command:", error);
    res.status(500).json({ error: error.message });
  }
});

//aici verificam conectarea cu sui, daca e instalat
app.get("/api/check-sui", async (req, res) => {
  try {
    const { stdout } = await execAsync("which sui");
    res.json({ path: stdout.trim() || "sui not found in PATH" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running: ${PORT}`);
});
