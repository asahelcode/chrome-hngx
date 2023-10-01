import { Duplex } from "stream";
import { createWriteStream, createReadStream } from "fs";

class DuplexStream extends Duplex {
  constructor(localFilePath) {
    super();
    this.localFileWriteStream = createWriteStream(localFilePath);
    this.localFileReadStream = createReadStream(localFilePath);

    this.localFileReadStream.on("data", (chunk) => {
      if (!this.push(chunk)) {
        // Stop reading if the internal buffer is full
        this.localFileReadStream.pause();
      }
    });

    this.localFileWriteStream.on("drain", () => {
      // Resume reading when the internal buffer is drained
      this.localFileReadStream.resume();
    });
  }

  _read(size) {
    // Resume reading from the local file
    this.localFileReadStream.resume();
  }

  _write(chunk, encoding, callback) {
    // Write the data to the local file
    if (!this.localFileWriteStream.write(chunk, encoding)) {
      // If the write buffer is full, pause reading until it drains
      this.localFileReadStream.pause();
    }

    callback();
  }

  _final(callback) {
    // Finalize the Duplex stream
    this.localFileWriteStream.end();
    callback();
  }
}
export default DuplexStream;
