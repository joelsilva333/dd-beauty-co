import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { getAdminSession } from "@/lib/auth";

const f = createUploadthing();

// Só a equipa (sessão de admin) pode carregar fotos de produto.
export const uploadRouter = {
  productImage: f({ image: { maxFileSize: "4MB", maxFileCount: 8 } })
    .middleware(async () => {
      const session = await getAdminSession();
      if (!session) throw new UploadThingError("Não autorizado");
      return { adminId: session.adminId };
    })
    .onUploadComplete(async ({ file }) => ({ url: file.ufsUrl })),
} satisfies FileRouter;

export type UploadRouter = typeof uploadRouter;
