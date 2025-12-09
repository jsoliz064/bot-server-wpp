import { writeFileSync, unlinkSync } from "fs";
import { join } from "path";

const saveFileBase64 = (fileBase64, fileName = null) => {
  try {
    const extension = getExtensionByBase64(fileBase64);
    const base64Data = fileBase64.replace(
      /^data:[a-zA-Z0-9]+\/[a-zA-Z0-9.-]+;base64,/,
      ""
    );

    fileName = fileName ?? Date.now();

    let file_url = join(
      process.cwd(),
      "/uploads/files",
      `${fileName}.${extension}`
    );
    writeFileSync(file_url, base64Data, "base64");
    file_url = file_url.replace(/\\/g, "/");
    console.log(`File saved on: ${file_url}`);
    return file_url;
  } catch (error) {
    return null;
  }
};

const deleteFilePath = (filePath) => {
  unlinkSync(filePath);
  console.log(`Archivo eliminado: ${filePath}`);
};

const getExtensionByBase64 = (fileBase64) => {
  const matches = fileBase64.match(
    /^data:([a-zA-Z0-9]+\/[a-zA-Z0-9.-]+);base64,/
  );

  if (!matches || matches.length !== 2) {
    throw new Error("Invalid file format");
  }

  const mimeType = matches[1];
  const extension = mimeType.split("/")[1];
  return extension;
};

export { saveFileBase64, deleteFilePath, getExtensionByBase64 };
