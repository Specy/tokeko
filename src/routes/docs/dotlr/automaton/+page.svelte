<script>
    import Page from "$cmp/layout/Page.svelte";
    import Card from "$cmp/layout/Card.svelte";
    import SyntaxHighlighter from "$cmp/SyntaxHighlighter.svelte";
</script>

<svelte:head>
    <title>
        Automaton
    </title>
    <meta name="description" content="The documentation of Tokeko: Automaton"/>
</svelte:head>

<Page cropped="70ch" padding='1rem' mobilePadding='1rem'>
    <h1 id="what-is-an-lr-1-automaton-">LR(1) Automaton</h1>
    <p>An <b>LR(1) Automaton</b> is a finite-state machine used in parsing, specifically in constructing
        <b>LR(1) parsers</b>, which are a type of bottom-up parser. The automaton is built from the grammar
        and guides the parser in determining how to analyze and reduce tokens in the input to construct the correct
        parse tree.</p>
    <h2>Components of an LR(1) Automaton</h2>
    <ol>
        <li><p><b>Items (States):</b><br>The states in the LR(1) automaton represent &quot;items.&quot; Each
            item is a snapshot of a possible parse at a given point in the input, typically written as:</p>
            <pre><code>A -&gt; α • β, x
</code></pre>
            <p>This means that the parser is currently in the middle of parsing the production <code>A -&gt; αβ</code>,
                and the dot (<code>•</code>) indicates how much of the right-hand side has been parsed. <code>x</code>
                is the lookahead token (the next input token expected after the current derivation).</p>
        </li>
        <li><p><b>Lookahead (1 token):</b><br>The &quot;1&quot; in LR(1) refers to the
            <b>lookahead</b> of 1 token. This means the parser makes decisions based on both the current state
            (items) and the next token in the input. The lookahead token helps the parser decide whether to shift (read
            more input) or reduce (apply a grammar rule).</p>
        </li>
        <li><p><b>Shift and Reduce Operations:</b></p>
            <ul>
                <li><b>Shift:</b> This operation moves the dot (<code>•</code>) in an item to the right,
                    meaning that the parser reads one more token from the input and transitions to a new state.
                </li>
                <li><b>Reduce:</b> When the dot is at the end of a production (e.g., <code>A -&gt; α •</code>),
                    the parser applies the corresponding grammar rule and &quot;reduces&quot; the input by recognizing
                    that a production is complete.
                </li>
            </ul>
        </li>
        <li><p><b>States and Transitions:</b><br>The automaton consists of <b>states</b> connected
            by <b>transitions</b>. Each state contains a set of items (representing different parts of the
            parsing process), and transitions between states occur based on reading symbols (either tokens or grammar
            symbols). </p>
            <p>For example, if you&#39;re in a state where you&#39;re expecting the next symbol to be <code>+</code> and
                the input contains <code>+</code>, the automaton will transition to the next state.</p>
        </li>
        <li><p><b>Closure and GOTO Functions:</b></p>
            <ul>
                <li><b>Closure:</b> The closure of a set of items adds new items to a state based on grammar
                    rules. If you&#39;re in a state where you&#39;re expecting a non-terminal symbol (like
                    <code>E</code>), the closure function adds items for every possible production of that non-terminal.
                </li>
                <li><b>Goto:</b> This function moves from one state to another based on the next symbol in the
                    input, determining the next possible parsing steps.
                </li>
            </ul>
        </li>
        <li><p><b>Acceptance and Conflicts:</b></p>
            <ul>
                <li>The automaton reaches the <b>accepting state</b> when the parser has successfully parsed
                    the entire input.
                </li>
                <li><b>Shift/Reduce conflicts</b> occur when the parser cannot decide whether to shift the
                    input (continue reading tokens) or reduce a rule (apply a grammar production). <b>Reduce/Reduce
                        conflicts</b> occur when the parser is uncertain which rule to apply. LR(1) parsers are
                    designed to avoid most of these conflicts through the lookahead token.
                </li>
            </ul>
        </li>
    </ol>
    <h2>How Does an LR(1) Automaton Work in Parsing?</h2>
    <ol>
        <li><p><b>Construct the Automaton:</b><br>The automaton is built by creating states and transitions
            based on the grammar rules, tracking all possible parsing actions the parser might take at each step.</p>
        </li>
        <li><p><b>Parsing Process:</b><br>The automaton drives the parsing process. Given an input string, the
            parser:</p>
            <ul>
                <li><b>Shifts</b> tokens from the input and moves to new states.</li>
                <li><b>Reduces</b> when it matches a rule, reducing the right-hand side of the rule to the
                    left-hand side.
                </li>
                <li>Continues this process until either the input is fully parsed (accepted) or an error is
                    encountered.
                </li>
            </ul>
        </li>
    </ol>

    <h2>
        Constructing the LR(1) Automaton
    </h2>
    <Card padding="1rem" style="overflow-x: auto;">
        <SyntaxHighlighter
                language="python"
                source={`# Setup the kernel of the first state
first_state = next_empty_state()
for rule in grammar.rules:
    if rule.symbol == grammar.start_symbol:
        first_state.add_item(Item(rule, dot=0, lookahead={$}))

# Initialize construction state
states_to_process = [first_state]
processed_states = []

# Iterate until there aren't any more states to process.
while len(states_to_process) > 0:
    # Get the state to process
    state_to_process = states_to_process.pop()

    # Computing closure of the state to process
    # Loop until no more items are added
    while True:
        new_items = []
        # Iterate current items to obtain new items
        for item in state_to_process.items:
            # If dot is not at the end of the pattern
            if item.dot != len(item.rule.pattern):
                # And if there is a symbol after dot
                if item.rule.pattern[item.dot].is_symbol:
                    # Compute the lookahead for the new item
                    if item.dot == len(item.rule.pattern) - 1:
                        # S -> ... . E <==> Tokens in the current lookahead can follow E
                        # --------------------------------------------------------------
                        lookahead = item.lookahead
                    elif item.rule.pattern[item.dot + 1].is_token:
                        # S -> ... . E '+' <==> '+' can follow E
                        # --------------------------------------
                        lookahead = {item.rule.pattern[item.dot + 1]}
                    elif item.rule.pattern[item.dot + 1].is_symbol:
                        # S -> ... . E F <==> Tokens in FIRST(F) can follow E
                        # ---------------------------------------------------
                        lookahead = first_sets[item.rule.pattern[item.dot + 1]]

                    # Iterate over the rules of the grammar
                    for rule in grammar.rules:
                        # If the rule is for the symbol after dot
                        if rule.symbol == item.rule.pattern[item.dot]:
                            # Create a new item from the rule, with dot at the beginning
                            new_item = Item(rule, dot=0, lookahead=lookahead)
                            # If the item is not already in items of the state
                            if new_item not in state_to_process.items:
                                # Add it the set of new items
                                new_items.push(new_item)

        # Process new items
        for new_item in new_items:
            # If a similar item with the same rule and the same dot but a different lookahead exists
            if state_to_process.has_same_base_item(new_item):
                # Merge lookaheads
                state_to_process.merge_base_items(new_item)

            # Otherwise
            else:
                # Add the new item directly
                state_to_process.items.add(new_item)

        # If state hasn't changed, break the loop
        if not state_to_process.items.has_changed():
            break

    # Merge the states to process with an already existing state with the same closure.
    replaced = False
    for existing_state_with_same_items in processed_states:
        if existing_state_with_same_items.items == state_to_process.items:
            replaced = True
            for state in processed_states:
                # Replace transitions from existing states to point to the correct state.
                state.transitions.replace_value(state_to_process, existing_state_with_same_items)
            break
    if replaced:
        # If it's merged with an existing state, there is nothing else to do
        continue

    # Compute transitions of from the state to process.
    for item in state_to_process.items:
        # If dot is not at the end
        if item.dot != len(item.rule.pattern):
            # S -> ... . E ... <==> Seeing E would cause a transition to another state
            # S -> ... . '+' ... <==> Seeing '+' would cause a transition to another state
            # ----------------------------------------------------------------------------
            atomic_pattern_after_dot = item.rule.pattern[item.dot]

            # If state to transition is not created yet, create an empty state for it.
            if atomic_pattern_after_dot is not in transitions:
                # Create an empty state to transition to
                state_to_process.transitions[atomic_pattern_after_dot] = next_empty_state()

            # Setup the kernel of the state to transition
            state_to_transition = state_to_process.transitions[atomic_pattern_after_dot]
            state_to_transition.items.push(item.shift_dot_to_right())

    # Add state to process to processed states, as we're done with it
    processed_states.push(state_to_process)`}
        />
    </Card>
</Page>

<style>
    @import "../common.scss";
</style>