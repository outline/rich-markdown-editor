// @flow
import extract from "png-chunks-extract";

/**
 * Detect if PNG image is in retina resolution.
 *
 * PNG Chunk documentation: https://www.w3.org/TR/PNG-Chunks.html
 */
export const isRetinaImage = async (url: string): Promise<boolean> => {
  const response = await fetch(url);
  if (response.ok && response.headers.get("content-type") === "image/png") {
    const buffer = await response.arrayBuffer();
    const chunks = extract(new Uint8Array(buffer));
    // Decode physical pixel dimensions chunk
    let pHYs;
    const pHYsChunk = chunks.find(chunk => chunk.name === "pHYs");
    if (pHYsChunk) {
      const metersToInchMultiplies = 39.3701;
      const buffer = Buffer.from(pHYsChunk.data);
      const xDpu = buffer.readUIntBE(0, 4);
      const yDpu = buffer.readUIntBE(4, 4);
      const xDpi = Math.round(xDpu / metersToInchMultiplies);
      const yDpi = Math.round(yDpu / metersToInchMultiplies);
      const unit = buffer.readUIntBE(8, 1) === 1 ? "meter" : undefined;
      pHYs = {
        xDpu,
        yDpu,
        xDpi,
        yDpi,
        unit,
      };
    }

    if (pHYs && pHYs.unit === "meter" && pHYs.xDpi >= 144 && pHYs.yDpi >= 144) {
      return true;
    }
  }
  return false;
};
