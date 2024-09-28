<script>
    import Page from "$cmp/layout/Page.svelte";
    import Card from "$cmp/layout/Card.svelte";
    import SyntaxHighlighter from "$cmp/SyntaxHighlighter.svelte";
</script>

<svelte:head>
    <title>
        Parsing tokens
    </title>
    <meta name="description" content="The documentation of Tokeko: Parsing tokens"/>
</svelte:head>

<Page cropped="70ch" padding='1rem' mobilePadding='1rem' gap="1rem">
    <h1>
        Parsing the tokens
    </h1>
    <p>
        A parsing algorithm analyzes a stream of tokens (produced by the lexer during tokenization) and determines whether
        they conform to the grammar of the language. The goal is to construct a <b>parse tree</b> (or syntax tree) that represents
        the hierarchical structure of the input based on the grammar rules.
    </p>

    <h2>
        Constructing the parse tree
    </h2>

    <Card padding="1rem" style="overflow-x: auto;">
        <SyntaxHighlighter
                language="python"
                source={`# Initialize the parsing state
state_stack = [ 0 ]
tree_stack = []
remaining_tokens.reverse()

# Get the first token
current_token = remaining_tokens.pop()

# Loop until algorithm either accepts or rejects
while True:
    # Get the current state
    current_state = state_stack[-1]

    # Get the action to take from ACTION table
    action_to_take = action_table[current_state, current_token]

    # If the action is to shift
    if action_to_take == Shift(next_state):
        # Create a terminal tree for the current token and push it to the tree stack
        tree_stack.push(TerminalNode(current_token));
        # Pop the next token
        current_token = remaining_tokens.pop()
        # Transition to the next state according to ACTION table
        state_stack.push(next_state);

    # If the action is to reduce
    elif action_to_take == Reduce(rule_index):
        # Get the length of the pattern of the rule, say N
        rule = grammar.rules[rule_index]
        pattern_length = len(rule.pattern)

        # Create a non-terminal tree with last N items in the tree stack
        tree = NonTerminalNode(rule.symbol, tree_stack[-pattern_length:])

        # Shrink state and tree stacks
        tree_stack = tree_stack[:-pattern_length]
        state_stack = state_stack[:-pattern_length]

        # Push the new tree to the tree stack
        tree_stack.push(tree)
        # Transition to the next state according to GOTO table
        state_stack.push(goto_table[state_stack[-1], rule.symbol])

    # If the action is to accept
    elif action_to_take == Accept(rule_index):
        # Create a final non-terminal tree with everything in the tree stack and return it
        return NonTerminalNode(grammar.start_symbol, tree_stack)

    # No action can be taken, so input is not well-formed
    else:
        # So raise an error
        raise ParsingError`}
        />
    </Card>
      <p style="margin-top: 1rem">
        For more info visit the <a href="https://github.com/umut-sahin/dotlr?tab=readme-ov-file#table-of-contents">dotlr</a> library docs
    </p>
</Page>