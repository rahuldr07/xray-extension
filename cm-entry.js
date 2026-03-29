import {EditorState} from "@codemirror/state"
import {EditorView, keymap, placeholder, lineNumbers, drawSelection, dropCursor, highlightActiveLine, highlightSpecialChars} from "@codemirror/view"
import {defaultKeymap, history, historyKeymap, indentWithTab} from "@codemirror/commands"
import {javascript} from "@codemirror/lang-javascript"
import {syntaxHighlighting, HighlightStyle, foldGutter, indentOnInput, bracketMatching} from "@codemirror/language"
import {tags as t} from "@lezer/highlight"
import {autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap} from "@codemirror/autocomplete"

export {
  EditorState,
  EditorView,
  keymap,
  placeholder,
  lineNumbers,
  drawSelection,
  dropCursor,
  highlightActiveLine,
  highlightSpecialChars,
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
  javascript,
  syntaxHighlighting,
  HighlightStyle,
  foldGutter,
  indentOnInput,
  bracketMatching,
  t,
  autocompletion,
  completionKeymap,
  closeBrackets,
  closeBracketsKeymap
};
