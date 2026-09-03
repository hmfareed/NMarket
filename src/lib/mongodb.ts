import mongoose from "mongoose";
import dns from "node:dns";

// Ensure Node's DNS resolver can resolve MongoDB Atlas SRV records on Windows
if (typeof dns.setServers === "function") {
  try {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
  } catch {
    // Fallback gracefully
  }
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseConnection: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  } | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.warn(
    "Warning: MONGODB_URI is not defined in environment variables. Defaulting to mongodb://localhost:27017/nmarket"
  );
}

const uri = MONGODB_URI || "mongodb://localhost:27017/nmarket";

let cached = global.mongooseConnection;

if (!cached) {
  cached = global.mongooseConnection = { conn: null, promise: null };
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached!.conn) {
    return cached!.conn;
  }

  if (typeof dns.setServers === "function") {
    try {
      dns.setServers(["8.8.8.8", "1.1.1.1"]);
    } catch {}
  }

  if (!cached!.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
    };

    cached!.promise = mongoose.connect(uri, opts).then((m) => {
      return m;
    });
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (e) {
    cached!.promise = null;
    throw e;
  }

  return cached!.conn;
}

export default connectToDatabase;
