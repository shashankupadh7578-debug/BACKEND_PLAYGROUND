-- CreateTable
CREATE TABLE "_bookmarks" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_bookmarks_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_bookmarks_B_index" ON "_bookmarks"("B");

-- AddForeignKey
ALTER TABLE "_bookmarks" ADD CONSTRAINT "_bookmarks_A_fkey" FOREIGN KEY ("A") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_bookmarks" ADD CONSTRAINT "_bookmarks_B_fkey" FOREIGN KEY ("B") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
