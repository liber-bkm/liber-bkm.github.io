{
  description = "liber docs site (Astro + Starlight) — rootless devshell";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
      in
      {
        devShells.default = pkgs.mkShell {
          packages = with pkgs; [
            nodejs_22
            pnpm
            git
          ];

          shellHook = ''
            export COREPACK_ENABLE_STRICT=0
            # Keep all JS tooling state inside the repo — no root, no $HOME writes
            export PNPM_HOME="$PWD/.nix-pnpm"
            export PATH="$PNPM_HOME:$PATH"
            export npm_config_cache="$PWD/.nix-npm-cache"
            export XDG_CACHE_HOME="$PWD/.nix-cache"
            mkdir -p "$PNPM_HOME" "$npm_config_cache" "$XDG_CACHE_HOME"
            echo ""
            echo "liber-docs devshell (node $(node --version), pnpm $(pnpm --version))"
            echo "  pnpm i    — install deps (local, no root)"
            echo "  pnpm dev  — local preview at http://127.0.0.1:4321"
            echo "  pnpm build — static output in dist/"
            echo ""
          '';
        };
      });
}
