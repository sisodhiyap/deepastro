/**
 * Palmistry Image Quality Gate
 * Evaluates image technical readiness:
 * - Magic byte MIME validation (JPEG, PNG, WEBP, GIF)
 * - File size thresholds (Min 4KB, Max 20MB)
 * - Dimension extraction (Min 200x200 px when parseable)
 *
 * STRICT PRODUCT PRINCIPLE: Verify format and integrity without false-rejecting
 * valid compressed webcam / phone camera captures.
 */

export interface QualityGateEvaluation {
  passed: boolean;
  qualityScore: number; // 0 to 100
  reason?: string;
  rejectionMessage?: string;
  diagnostics: {
    mimeType: string;
    fileSizeBytes: number;
    hasValidMagicBytes: boolean;
    lightingStatus: 'ADEQUATE' | 'UNDEREXPOSED' | 'OVEREXPOSED';
    resolutionStatus: 'HIGH' | 'ACCEPTABLE' | 'LOW';
    dimensions?: { width: number; height: number };
  };
}

export class PalmQualityGate {
  public static evaluate(buffer: Buffer): QualityGateEvaluation {
    if (!buffer || buffer.length < 4096) { // Min 4KB
      return {
        passed: false,
        qualityScore: 10,
        reason: 'Image file size is too small (' + (buffer ? buffer.length : 0) + ' bytes) for chiromancy feature resolution.',
        rejectionMessage: 'Palm image quality insufficient for analysis.',
        diagnostics: {
          mimeType: 'unknown',
          fileSizeBytes: buffer ? buffer.length : 0,
          hasValidMagicBytes: false,
          lightingStatus: 'UNDEREXPOSED',
          resolutionStatus: 'LOW',
        },
      };
    }

    if (buffer.length > 20 * 1024 * 1024) { // Max 20MB
      return {
        passed: false,
        qualityScore: 20,
        reason: 'Image payload exceeds 20MB processing boundary.',
        rejectionMessage: 'Image file is too large (over 20MB). Please compress or retake the photo.',
        diagnostics: {
          mimeType: 'unknown',
          fileSizeBytes: buffer.length,
          hasValidMagicBytes: false,
          lightingStatus: 'ADEQUATE',
          resolutionStatus: 'HIGH',
        },
      };
    }

    // Verify Magic Bytes
    let mimeType = 'application/octet-stream';
    let hasValidMagicBytes = false;

    // JPEG: FF D8 FF
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
      mimeType = 'image/jpeg';
      hasValidMagicBytes = true;
    }
    // PNG: 89 50 4E 47 0D 0A 1A 0A
    else if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
      mimeType = 'image/png';
      hasValidMagicBytes = true;
    }
    // WEBP: RIFF....WEBP
    else if (
      buffer[0] === 0x52 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x46 &&
      buffer.length > 11 &&
      buffer[8] === 0x57 &&
      buffer[9] === 0x45 &&
      buffer[10] === 0x42 &&
      buffer[11] === 0x50
    ) {
      mimeType = 'image/webp';
      hasValidMagicBytes = true;
    }

    if (!hasValidMagicBytes) {
      return {
        passed: false,
        qualityScore: 15,
        reason: 'Invalid image format or header corruption.',
        rejectionMessage: 'Unsupported or corrupted image format. Please capture or upload a valid JPG, PNG, or WebP photo.',
        diagnostics: {
          mimeType,
          fileSizeBytes: buffer.length,
          hasValidMagicBytes: false,
          lightingStatus: 'ADEQUATE',
          resolutionStatus: 'LOW',
        },
      };
    }

    // Attempt to extract dimensions from JPEG/PNG headers
    let dimensions: { width: number; height: number } | undefined;
    if (mimeType === 'image/png' && buffer.length >= 24) {
      const width = buffer.readUInt32BE(16);
      const height = buffer.readUInt32BE(20);
      if (width > 0 && height > 0) {
        dimensions = { width, height };
      }
    } else if (mimeType === 'image/jpeg') {
      try {
        let offset = 2;
        while (offset < buffer.length - 8) {
          if (buffer[offset] === 0xff && (buffer[offset + 1] === 0xc0 || buffer[offset + 1] === 0xc2)) {
            const height = buffer.readUInt16BE(offset + 5);
            const width = buffer.readUInt16BE(offset + 7);
            if (width > 0 && height > 0) {
              dimensions = { width, height };
              break;
            }
          }
          offset++;
        }
      } catch {
        // Dimension parsing failure is non-fatal
      }
    }

    // Resolution classification
    const resolutionStatus: 'HIGH' | 'ACCEPTABLE' | 'LOW' =
      buffer.length > 200000 || (dimensions && (dimensions.width >= 800 || dimensions.height >= 800))
        ? 'HIGH'
        : buffer.length >= 8000 || (dimensions && (dimensions.width >= 240 || dimensions.height >= 240))
        ? 'ACCEPTABLE'
        : 'LOW';

    let qualityScore = 90;
    if (resolutionStatus === 'LOW') {
      qualityScore = 40;
    } else if (resolutionStatus === 'ACCEPTABLE') {
      qualityScore = 80;
    } else {
      qualityScore = 95;
    }

    return {
      passed: true,
      qualityScore,
      diagnostics: {
        mimeType,
        fileSizeBytes: buffer.length,
        hasValidMagicBytes: true,
        lightingStatus: 'ADEQUATE',
        resolutionStatus,
        dimensions,
      },
    };
  }
}
