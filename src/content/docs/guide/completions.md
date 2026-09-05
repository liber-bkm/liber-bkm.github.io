---
title: Shell completions
description: Tab-completion for commands, flags, ids, tags, and folders.
---

```sh
liber completion bash > ~/.local/share/bash-completion/completions/liber
liber completion zsh > ~/.zsh/completions/_liber        # add dir to $fpath, then compinit
liber completion fish > ~/.config/fish/completions/liber.fish
```

Completes all commands and flags, fetching bookmark ids, tag names, and folder names live from liber itself (`liber -l`, `liber --tags`, `liber --folders`), so suggestions always reflect the active profile.
