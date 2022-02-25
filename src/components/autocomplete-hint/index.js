import React, {
    useState,
    cloneElement,
    useEffect,
    useRef,
    ReactElement
} from 'react';
import useThemeDetector from '../useThemeDetector'

import {
    mergeRefs,
    interpolateStyle,
    sortAsc,
    getFirstDuplicateOption
} from './utils';


export const Hint = props => {
    const child = React.Children.only(props.children);

    // if (child.type?.toString()?.toLowerCase() !== 'input') {
    //     throw new TypeError(`react-autocomplete-hint: 'Hint' only accepts an 'input' element as child.`);
    // }

    const {
        options,
        disableHint,
        allowTabFill,
        onFill,
        onHint,
        valueModifier
    } = props;

    const childProps = child.props;

    // const isDarkTheme = useThemeDetector()

    let mainInputRef = useRef(null);
    let hintWrapperRef = useRef(null);
    let hintRef = useRef(null);
    const [unModifiedText, setUnmodifiedText] = useState('');
    const [text, setText] = useState('');
    const [hint, setHint] = useState('');
    const [match, setMatch] = useState();
    const [changeEvent, setChangeEvent] = useState();

    useEffect(() => {
        if (options == null) return
        if (typeof options[0] === 'object') {
            const duplicate = getFirstDuplicateOption();
            if (duplicate) {
                console.warn(`react-autocomplete-hint: "${duplicate}" occurs more than once and may cause errors. Options should not contain duplicate values!`);
            }
        }
    }, []);

    useEffect(() => {
        if (disableHint) {
            return;
        }

        const inputStyle = mainInputRef.current && window.getComputedStyle(mainInputRef.current);
        inputStyle && styleHint(hintWrapperRef, hintRef, inputStyle);
    });

    const getMatch = (text) => {
        if (!text || text === '') {
            return;
        }

        if (typeof (options[0]) === 'string') {
            const match = (options)
                .filter(x => x.toLowerCase() !== text.toLowerCase() && x.toLowerCase().startsWith(text.toLowerCase()))
                .sort()[0];

            return match;
        } else {
            const match = (options)
                .filter(x => x.label.toLowerCase() !== text.toLowerCase() && x.label.toLowerCase().startsWith(text.toLowerCase()))
                .sort((a, b) => sortAsc(a.label, b.label))[0];

            return match;
        }
    };

    const setHintTextAndId = (text) => {
        setText(text);

        const match = getMatch(text);
        let hint;

        if (!match) {
            hint = '';
        }
        else if (typeof match === 'string') {
            hint = match.slice(text.length);
        } else {
            hint = match.label.slice(text.length);
        }

        setHint(hint);
        setMatch(match);
        onHint && onHint(match)
    }

    const handleOnFill = () => {
        if (hint !== '' && changeEvent) {
            changeEvent.target.value = unModifiedText + hint;
            childProps.onChange && childProps.onChange(changeEvent);
            setHintTextAndId('');
            setUnmodifiedText(unModifiedText + hint)
            onFill && onFill(match);
        }
    };

    const styleHint = (
        hintWrapperRef,
        hintRef,
        inputStyle) => {        
        if (hintWrapperRef?.current?.style) {
            hintWrapperRef.current.style.fontFamily = inputStyle.fontFamily;
            hintWrapperRef.current.style.fontSize = inputStyle.fontSize;
            hintWrapperRef.current.style.width = inputStyle.width;
            hintWrapperRef.current.style.height = inputStyle.height;
            hintWrapperRef.current.style.lineHeight = inputStyle.lineHeight;
            hintWrapperRef.current.style.boxSizing = inputStyle.boxSizing;
            hintWrapperRef.current.style.margin = interpolateStyle(inputStyle, 'margin');
            hintWrapperRef.current.style.padding = interpolateStyle(inputStyle, 'padding');
            hintWrapperRef.current.style.borderStyle = interpolateStyle(inputStyle, 'border', 'style');
            hintWrapperRef.current.style.borderWidth = interpolateStyle(inputStyle, 'border', 'width');
        }

        if (hintRef?.current?.style) {
            hintRef.current.style.fontFamily = inputStyle.fontFamily;
            hintRef.current.style.fontSize = inputStyle.fontSize;
            hintRef.current.style.lineHeight = inputStyle.lineHeight;
        }
    };

    const onChange = (e) => {
        setChangeEvent(e);
        e.persist();

        setUnmodifiedText(e.target.value);
        const modifiedValue = valueModifier ? valueModifier(e.target.value) : e.target.value;
        setHintTextAndId(modifiedValue);

        childProps.onChange && childProps.onChange(e);
    };

    const onFocus = (e) => {
        setHintTextAndId(e.target.value);
        childProps.onFocus && childProps.onFocus(e);
    };

    const onBlur = (e) => {
        //Only blur it if the new focus isn't the the hint input
        if (hintRef?.current !== e.relatedTarget) {
            setHintTextAndId('');
            childProps.onBlur && childProps.onBlur(e);
        }
    };

    const ARROWRIGHT = 'ArrowRight';
    const TAB = 'Tab';
    const onKeyDown = (e) => {
        const caretIsAtTextEnd = (() => {
            // For selectable input types ("text", "search"), only select the hint if
            // it's at the end of the input value. For non-selectable types ("email",
            // "number"), always select the hint.

            const isNonSelectableType = e.currentTarget.selectionEnd === null;
            const caretIsAtTextEnd = isNonSelectableType || e.currentTarget.selectionEnd === e.currentTarget.value.length;

            return caretIsAtTextEnd;
        })();

        if (caretIsAtTextEnd && e.key === ARROWRIGHT) {
            handleOnFill();
        } else if (caretIsAtTextEnd && allowTabFill && e.key === TAB && hint !== '') {
            e.preventDefault();
            handleOnFill();
        }

        childProps.onKeyDown && childProps.onKeyDown(e);
    };

    const onHintClick = (e) => {
        const hintCaretPosition = e.currentTarget.selectionEnd || 0;

        // If user clicks the position before the first character of the hint, 
        // move focus to the end of the mainInput text
        if (hintCaretPosition === 0) {
            mainInputRef.current?.focus();
            return;
        }

        if (!!hint && hint !== '') {
            handleOnFill();
            setTimeout(() => {
                mainInputRef.current?.focus();
                const caretPosition = text.length + hintCaretPosition;
                mainInputRef.current?.setSelectionRange(caretPosition, caretPosition);
            }, 0);
        }
    };

    const childRef = cloneElement(child).ref;
    const mainInput = cloneElement(
        child,
        {
            ...childProps,
            onChange,
            onBlur,
            onFocus,
            onKeyDown,
            ref: childRef && typeof (childRef) !== 'string'
                ? mergeRefs(childRef, mainInputRef)
                : mainInputRef
        }
    );

    return (
        <div
            style={{
                position: 'relative'
            }} className="w-full">
            {
                disableHint
                    ? child
                    : (
                        <>
                            {mainInput}
                            <span
                                ref={hintWrapperRef}
                                className="flex bg-transparent dark:text-slate-200 pointer-events-none text-slate-800 absolute top-0  left-0"
                            >
                                <span
                                    style={{
                                        visibility: 'hidden',
                                        pointerEvents: 'none',
                                        whiteSpace: 'pre'
                                    }}
                                    {...props}
                                >
                                    {text}
                                </span>
                                <input
                                    style={{
                                        pointerEvents: !hint || hint === '' ? 'none' : 'visible'
                                    }}
                                    className="bg-transparent outline-none dark:text-zinc-200 text-slate-800 opacity-50 p-0 w-full  m-0 caret-transparent "
                                    ref={hintRef}
                                    onClick={onHintClick}
                                    defaultValue={hint}
                                    tabIndex={-1}
                                />
                            </span>
                        </>
                    )
            }
        </div>
    );
}

export default Hint