import { useEffect } from 'react';

/**
 *
 * @param {*} ref - Ref of your parent div
 * @param {*} callback - Callback which can be used to change your maintained state in your component
 * @author Pranav Shinde 30-Nov-2021
 */
const useOutsideClick = (ref, callback) => {
    useEffect(() => {
        const handleClickOutside = (evt) => {
            if (ref.current && !ref.current.contains(evt.target)) {
                callback(); //Do what you want to handle in the callback
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    });
};

export default useOutsideClick;