# Vitest Demo

## Getting Started

```pwsh
yarn install
```

## Coverage Reports

```pwsh
yarn coverage
```

This generates coverage in multiple formats (`text`, `html`, `lcov`, `cobertura`) under the `coverage/` directory.

### `ast-v8-to-istanbul` Line Coverage Bug

`@vitest/coverage-v8` uses `ast-v8-to-istanbul` to convert V8 coverage data into Istanbul format.
In `ast-v8-to-istanbul@1.0.0`, `ConditionalExpression` (ternary `? :`) and `LogicalExpression` (`&&`, `||`) branches are tracked as **branch coverage only** — no line/statement entries are emitted for the individual branch targets. This means untested JSX paths like `{isLoggedIn ? <A/> : <B/>}` show 100% line coverage even when one side is never rendered.

#### Seeing the difference

**With the original (unpatched) package:**

```pwsh
# Remove the patch resolution and reinstall
# In package.json, delete the "resolutions" block, then:
yarn install
yarn coverage
```

You'll see `component.tsx` report **100% Statements / 100% Lines** with no uncovered line numbers, despite only testing `isLoggedIn=true, isAdmin=false`.

Console output (unpatched):

```
 % Coverage report from v8
---------------|---------|----------|---------|---------|-------------------
File           | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
---------------|---------|----------|---------|---------|-------------------
All files      |     100 |       50 |     100 |     100 |                   
 basic.ts      |     100 |      100 |     100 |     100 |                   
 component.tsx |     100 |       50 |     100 |     100 | 12-17             
---------------|---------|----------|---------|---------|-------------------
```

**With the patched package:**

```pwsh
# Restore the "resolutions" block in package.json, then:
yarn install
yarn coverage
```

You'll see `component.tsx` correctly report **66.66% Statements / 80% Lines** with **line 15** (`<span>Please log in.</span>`) marked as uncovered (0 hits).

Console output (patched):

```
 % Coverage report from v8
---------------|---------|----------|---------|---------|-------------------
File           | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
---------------|---------|----------|---------|---------|-------------------
All files      |      75 |       50 |     100 |   83.33 |                   
 basic.ts      |     100 |      100 |     100 |     100 |                   
 component.tsx |   66.66 |       50 |     100 |      80 | 15                
---------------|---------|----------|---------|---------|-------------------
```

#### What the patch does

The patch adds `mapper.onStatement(branch)` calls in the `onConditionalExpression` and `onLogicalExpression` AST visitors, so each branch target is tracked as a statement using its own V8 byte range for hit count lookup — matching the behavior already present in `onIfStatement`.

#### Expected Cobertura XML diff

The following unified diff shows the expected change in `coverage/cobertura-coverage.xml` for `component.tsx` after applying the patch:

```diff
 <class name="component.tsx" filename="src\component.tsx" line-rate="1" branch-rate="0.5">
+<class name="component.tsx" filename="src\component.tsx" line-rate="0.8" branch-rate="0.5">
   <methods>
     <method name="(anonymous_0)" hits="1" signature="()V">
       <lines>
         <line number="9" hits="1"/>
       </lines>
     </method>
   </methods>
   <lines>
     <line number="9" hits="1" branch="false"/>
     <line number="10" hits="1" branch="false"/>
+    <line number="13" hits="1" branch="false"/>
+    <line number="15" hits="0" branch="false"/>
+    <line number="17" hits="1" branch="true" condition-coverage="50% (1/2)"/>
   </lines>
 </class>
```

Key changes:
- `line-rate` drops from `1` to `0.8` (4 of 5 lines covered)
- **Line 13** (`<span>Welcome, {username}!</span>`) — now tracked, 1 hit
- **Line 15** (`<span>Please log in.</span>`) — now tracked, **0 hits** (untested ternary branch)
- **Line 17** (`{isAdmin && <span> (Admin)</span>}`) — now tracked with `branch="true"` and `condition-coverage="50% (1/2)"`

Learn more at https://vitest.dev
