{ pkgs, lib, config, inputs, ... }:
{
  packages = [ pkgs.nodejs_24 pkgs.pnpm ];
}
