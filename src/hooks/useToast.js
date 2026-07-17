export function useToast() {

    const [toast, setToast] = useState(null);


    function showToast(msg) {

        setToast(msg);

        setTimeout(() => {
            setToast(null)
        }, 1800)

    }


    return {
        toast,
        showToast
    }

}