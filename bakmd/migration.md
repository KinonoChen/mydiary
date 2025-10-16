# Prisma 数据库迁移方案：处理已有重要数据的漂移数据库 踩坑记录

当你拥有一个包含重要数据的现有 SQLite 数据库，并且该数据库的当前结构（可称为“旧版 schema”）与 Prisma 的迁移历史不一致（或从未被 Prisma Migrate 管理过），导致 `prisma migrate dev` 提示需要重置数据库时，可以遵循以下步骤来安全地生成迁移文件，而无需丢失数据。

**核心目标：**

1.  让 Prisma Migrate 认可你现有数据库的结构（旧版 schema）作为第一个“基线”迁移。
2.  基于这个基线，再生成从旧版 schema 到新版 schema（例如，添加新表或字段）的增量迁移。

**前提：**

*   你有两份 Prisma Schema 定义：
    *   `old.prisma`：描述你当前生产/重要数据库结构的 schema。
    *   `new.prisma`：你希望数据库迁移到的目标结构的 schema。
*   你的开发数据库文件（例如 `dev_pri.db`）包含重要数据，不能被重置。
*   你的项目根目录下有 `prisma/schema.prisma` 文件，并且 `.env` 文件中配置了 `DATABASE_URL` 指向你的开发数据库。

**步骤概览：**

1.  **准备工作：**
    *   **备份！** 备份你的开发数据库文件 (`dev_pri.db`)。这是最重要的保险。
    *   确保 `prisma/schema.prisma` 的内容与你的 `old.prisma`（即当前数据库的实际结构）一致。

2.  **生成代表当前数据库结构的“初始”迁移 SQL：**
    *   **清空迁移历史**：删除 `prisma/migrations/` 目录下的所有内容。
    *   **隔离数据库**：临时重命名你的开发数据库文件 `dev_pri.db` (例如，改为 `dev_pri.db.backup`)。这样做是为了让 Prisma 在下一步认为没有数据库存在。
    *   **生成初始迁移**：在项目根目录运行：
        ```bash
        npx prisma migrate dev --name "initial_setup_from_old_schema"
        ```
        *   由于 Prisma 找不到数据库，它会根据当前的 `prisma/schema.prisma` (即 `old.prisma` 的内容) 生成一个新的迁移文件夹（例如 `prisma/migrations/YYYYMMDDHHMMSS_initial_setup_from_old_schema/`），其中包含 `migration.sql`。这个 SQL 文件包含了创建所有表和索引以匹配 `old.prisma` 的命令。
        *   这个命令也会创建一个新的、空的 `dev_pri.db` 文件并应用这个迁移。
    *   **恢复原始数据库并清理**：
        *   删除刚刚由上一步命令新创建的 `dev_pri.db` 文件。
        *   将你之前重命名的原始数据库文件 (例如 `dev_pri.db.backup`) **改回** `dev_pri.db`。

3.  **将生成的“初始”迁移标记为已在你的原始数据库上应用：**
    *   你的 `prisma/schema.prisma` 此时仍然是 `old.prisma` 的内容。
    *   运行以下命令（将 `YYYYMMDDHHMMSS_initial_setup_from_old_schema` 替换为上一步实际生成的迁移文件夹名称）：
        ```bash
        npx prisma migrate resolve --applied "YYYYMMDDHHMMSS_initial_setup_from_old_schema"
        ```
        *   这会在你的原始 `dev_pri.db` 的 `_prisma_migrations` 表中记录这条迁移已应用，告诉 Prisma 你的数据库现在处于这个“初始”状态。

4.  **准备生成增量迁移：**
    *   将 `prisma/schema.prisma` 文件的内容更新为你的 `new.prisma`（即你期望的最终数据库结构）。

5.  **生成从旧结构到新结构的增量迁移：**
    *   运行：
        ```bash
        npx prisma migrate dev --name "add_new_features_or_changes"
        ```
        (将 `"add_new_features_or_changes"` 替换为描述性名称，例如 `"add_user_tags_table"`）。
    *   此时，Prisma 应该会：
        *   比较当前的 `prisma/schema.prisma` (新结构) 与 `_prisma_migrations` 表中记录的最后一次迁移 (即我们刚刚解析的 `...initial_setup_from_old_schema`)。
        *   检测到差异，并生成一个新的迁移文件夹，其中包含从旧结构更新到新结构所需的 SQL 命令。
        *   **不会**再提示重置数据库。
        *   自动将这个新的增量迁移应用到你的 `dev_pri.db`。

6.  **处理可能出现的孤立迁移记录 (如果遇到)：**
    *   如果在上一步中，你遇到错误提示类似 `The following migration(s) are applied to the database but missing from the local migrations directory: XXXXXX_some_old_migration_name`，这通常意味着在早期操作中，数据库的 `_prisma_migrations` 表里残留了一条不再存在于 `prisma/migrations` 文件夹中的记录。
    *   **解决方案**：手动连接到你的 SQLite 数据库 (`dev_pri.db`)，找到 `_prisma_migrations` 表，并删除那条孤立的、不存在于本地文件系统的迁移记录。然后重新运行步骤 5 的 `prisma migrate dev` 命令。

**最终结果：**

*   你的 `prisma/migrations/` 文件夹现在包含至少两个迁移：一个初始基线迁移和一个或多个增量迁移。
*   你的开发数据库 (`dev_pri.db`) 结构已更新到最新，并且数据得以保留。

**部署到生产环境：**

1.  **再次备份你的生产数据库！**
2.  将你的整个项目（包括 `prisma/schema.prisma` 和完整的 `prisma/migrations/` 文件夹）部署到生产环境。
3.  在生产环境的项目根目录下运行：
    ```bash
    npx prisma migrate deploy
    ```
    这将按顺序应用所有尚未在生产数据库上应用的迁移。

这个过程虽然步骤较多，但是能够确保在复杂情况下安全地管理和迁移现有数据库。