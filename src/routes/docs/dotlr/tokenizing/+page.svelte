<script>
    import Page from "$cmp/layout/Page.svelte";
    import Card from "$cmp/layout/Card.svelte";
    import SyntaxHighlighter from "$cmp/SyntaxHighlighter.svelte";
</script>

<svelte:head>
    <title>
        Tokenizing
    </title>
    <meta name="description" content="The documentation of Tokeko: Tokenizing"/>
</svelte:head>

<Page cropped="70ch" padding='1rem' mobilePadding='1rem' gap="1rem">
    <h1>
        Tokenizing
    </h1>
    <p>
        Tokenization is the process of breaking an input string (usually source code or text) into meaningful units
        called tokens.
        A token is the smallest sequence of characters that carries meaning in the context of a language, like keywords,
        operators, identifiers, or literals.
        Tokenization is often the first step in a compiler or interpreter’s workflow, preceding parsing.
    </p>
    <p>
        Tokenization is also called lexical analysis, where the input string is scanned from left to right, and
        sequences of characters are grouped into tokens. This step is performed by a lexer (or scanner), a component
        responsible for converting the raw input into a stream of tokens.
    </p>
    <p>
        For example, in the c language, the statement <code>int x = 42;</code> can be tokenized into the following
        tokens:
        <code>int</code>, <code>x</code>, <code>=</code>, <code>42</code>, <code>;</code>.
    </p>

    <h2>
        Tokenization Pseudo Code
    </h2>
    <Card padding="1rem" style="overflow-x: auto;">
        <SyntaxHighlighter
                language="python"
                source={`# Initialize the result
tokens = []

# Loop until all of the input is consumed
remaining_input = input.trim();
while len(remaining_input) > 0:
    # Try to match regular expression tokens
    for (regex_token, regex) in grammar.regular_expressions:
        if match := regex.start_matches(remaining_input):
            # We have a match so add it to result
            tokens.push(regex_token)
            # And shrink remaining input
            remaining_input = remaining_input[match.end:].trim()
            break

    # No regular expression tokens matched
    else:
        # So try to match constant tokens
        for constant_token in grammar.constant_tokens:
          if remaining_input.startswith(constant_token):
              # We have a match so add it to result
              tokens.push(constant_token)
              # And shrink remaining input
              remaining_input = remaining_input[len(constant_token):]
              break

        # No tokens matched
        else:
              raise TokenizationError

# Lastly, add the end of input token so the parser eventually accepts.
tokens.push($)`}
        />
    </Card>
      <p style="margin-top: 1rem">
        For more info visit the <a href="https://github.com/umut-sahin/dotlr?tab=readme-ov-file#table-of-contents">dotlr</a> library docs
    </p>
</Page>


<style>
    @import "../common.scss";
</style>