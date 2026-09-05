# DeepAstro PDF QA & Round-Trip Verification Specification (Checkpoint 9)

## 1. Hard Architectural Requirement
- **HTML is NOT a PDF.** DeepAstro requires true binary PDF artifact generation using headless Chromium/Edge via Puppeteer.
- Every PDF artifact must begin with the standard binary magic number `%PDF-`.
- Empty files, corrupt streams, or HTML-wrapped payloads are strictly rejected.

---

## 2. Binary Verification Invariants
Each generated PDF artifact is analyzed prior to database registration:
1. **Magic Header Check**:
   `buffer.subarray(0, 5).toString('ascii') === '%PDF-'`
2. **Non-Zero Byte Length**:
   `buffer.length > 0` (typically 100KB to 1.5MB).
3. **Cryptographic Hashing**:
   SHA-256 hash computed and persisted in `pdf_artifacts` table for immutability auditing.
4. **MIME Type**:
   `application/pdf`.

---

## 3. Round-Trip Data Extraction
Extracted via `pdf-parse` directly from the binary buffer:
- **Native Identity**: Native's full name, birth date, birth time, and birth place.
- **Astronomical Anchors**: Lagna Sign, Moon Sign, Sun Sign, and Nakshatra.
- **Dasha Progression**: Current Mahadasha and Current Antardasha lords.
- **Navagrahas Placements**: All 9 planetary names verified in chart tables.
- **Numerology Snapshot**: Life path, destiny, and birth numbers.

If any primary astronomical anchor is missing from the extracted text:
`PDF_VERIFICATION_FAILED` is issued, the report integrity gate is marked `BLOCKED`, and download is prohibited.

---

## 4. Visual Layout QA Checks
Automated layout inspection verifies:
- Expected page count (minimum 3 pages, maximum 45 pages depending on report depth).
- Zero blank pages.
- Header and footer presence with DeepAstro copyright and branding.
- Kundli chart diagram (North, South, or East Indian style) rendered without broken glyphs.
- Non-overlapping typography using Indian editorial aesthetic (Cinzel, Inter, Outfit).
