# Docsify 发布快照

VitePress 迁移前的完整 Docsify 站点保留在 Git 提交 `42e6faa`。该提交包含原始 `docs/index.html`、导航、内容和静态资源，可作为只读快照或紧急回滚源。

查看旧入口：

```bash
git show 42e6faa:docs/index.html
```

恢复时从该提交创建独立的临时分支并部署，不要覆盖当前 `master` 或用户工作区中的未提交改动。
