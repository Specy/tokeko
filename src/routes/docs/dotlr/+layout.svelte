<script lang="ts">
    import Column from "$cmp/layout/Column.svelte";
    import Row from "$cmp/layout/Row.svelte";
    import MenuLink from "$src/routes/docs/dotlr/MenuLink.svelte";
    import Nav from "$cmp/layout/Nav.svelte";
    import Button from "$cmp/inputs/Button.svelte";
    import {createProject} from "$stores/userProjectsStore";
    import lzstring from "lz-string";
    import FaChevron from "~icons/fa6-solid/chevron-left.svelte";

    const p = createProject();
    const s = lzstring.compressToEncodedURIComponent(JSON.stringify(p));
    const url = `/projects/share?project=${s}`;
    let menuOpen = false
</script>
<Nav style="border-bottom-left-radius: 0;">

</Nav>

<Row gap="1rem" flex1>
    <button
            class="side-menu-underlay"
            class:side-menu-underlay-open={menuOpen}
            on:click={() => (menuOpen = false)}
    >

    </button>
    <aside class="side-menu col" class:menu-open={menuOpen}>
        <div class="mobile-only side-menu-open-btn">
            <Button
                    hasIcon
                    on:click={() => (menuOpen = !menuOpen)}
                    style="
                    border-top-left-radius: 0;
                    border-bottom-left-radius: 0;
                    padding: 0.6rem;
                    background-color: rgba(var(--accent-rgb), 0.8);
                    backdrop-filter: blur(0.1rem);
                    "
            >
                <FaChevron
                        style={`transition: all 0.3s;transform: rotate(${menuOpen ? '0deg' : '180deg'})`}
                />
            </Button>
        </div>
        <Column gap="1rem" flex1 padding="0 1rem">
            <MenuLink
                    href="/docs/dotlr/"
                    title="Introduction"
                    on:click={() => (menuOpen = false)}
            />
            <MenuLink
                    href="/docs/dotlr/grammar"
                    title="Grammar"
                    on:click={() => (menuOpen = false)}
            />
            <MenuLink
                    href="/docs/dotlr/first-and-follow"
                    title="First & Follow"
                    on:click={() => (menuOpen = false)}
            />
            <MenuLink
                    href="/docs/dotlr/automaton"
                    title="Automaton"
                    on:click={() => (menuOpen = false)}
            />
            <MenuLink
                    href="/docs/dotlr/action-and-goto"
                    title="Action & Goto"
                    on:click={() => (menuOpen = false)}
            />
            <MenuLink
                    href="/docs/dotlr/tokenizing"
                    title="Tokenizing"
                    on:click={() => (menuOpen = false)}
            />
            <MenuLink
                    href="/docs/dotlr/parsing-tokens"
                    title="Parsing tokens"
                    on:click={() => (menuOpen = false)}
            />
            <MenuLink
                    href="/docs/dotlr/typescript-parser"
                    title="Typescript runtime"
                    on:click={() => (menuOpen = false)}
            />
            <a href="{url}" class="tryit">
                Try it
            </a>
        </Column>

    </aside>
    <div class="mock">

    </div>
    <Column style="padding-top: 1rem; width: 100%; overflow-x: hidden;">
        <slot/>
    </Column>
</Row>

<style lang="scss">

  .side-menu {
    position: fixed;
    background-color: var(--primary);
    color: var(--secondary-text);
    width: 15rem;
    gap: 1rem;
    top: 3rem;
    padding: 0.8rem 0;
    border-top: solid 0.2rem var(--secondary);
    height: calc(100vh - 3.2rem);
    z-index: 10;
  }
  .mock{
    width: 15rem;
    min-width: 15rem;
  }
  .tryit {
    border-radius: 0.8rem;
    width: 100%;
    background-color: var(--accent);
    color: var(--accent-text);
    padding: 0.5rem 1rem;
    text-align: center;
    margin-top: auto;
  }

  .mobile-only {
    display: none;
  }

  .side-menu-open-btn {
    margin-right: -2.6rem;
    justify-content: flex-end;
  }

  @media (max-width: 900px) {
    .side-menu {
      position: fixed;
      width: calc(100vw - 4rem);
      left: 0;
      z-index: 5;
      transition: transform 0.3s;
      transform: translateX(-100%);
      background-color: rgba(var(--primary-rgb), 0.9);
    }
    .mobile-only {
      display: flex;
    }
    .menu-open {
      transform: translateX(0);
    }
    .mock{
      display: none;
    }
  }

  .instruction-search {
    background-color: var(--tertiary);
    color: var(--tertiary-text);
    padding: 0.6rem;
    border-radius: 0.4rem;
  }

  .icon {
    height: 2.2rem;
    display: flex;
    align-items: center;
    gap: 1rem;

    img {
      height: 100%;
    }

    &:hover {
      color: var(--accent)
    }
  }

  .side-menu-underlay {
    position: fixed;
    top: 3.2rem;
    left: 0;
    width: 100vw;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    opacity: 0;
    pointer-events: none;
    cursor: pointer;
    z-index: 3;
    transition: opacity 0.3s;
    backdrop-filter: blur(0.2rem);
  }

  .side-menu-underlay-open {
    opacity: 1;
    pointer-events: all;
  }

</style>