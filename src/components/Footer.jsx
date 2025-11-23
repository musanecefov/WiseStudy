export default function  Footer(){
    return (
        <footer className="flex flex-col md:flex-row justify-between mt-4 shadow-md bg-white p-4 md:p-8 gap-8">
            <div className="space-y-3 w-full md:w-1/4">
                <h2 className="font-bold text-xl">WiseStudy</h2>
                <p className="text-lg text-gray-500">Azərbaycanlı şagirdlər üçün dövlət imtahanlarına hazırlıq platforması</p>
            </div>
            <div className="space-y-2 font-light flex flex-col items-start">
                <p className="text-lg font-normal">KEÇİDLƏR</p>
                <p>Haqqımızda</p>
                <p>Fənlər</p>
                <p>Qiymətlər</p>
                <p>Bloq</p>
            </div>
            <div className="space-y-2 font-light flex flex-col items-start">
                <p className="text-lg font-normal">DƏSTƏK</p>
                <p>Yardım Mərkəzi</p>
                <p>Tez-tez verilən suallar</p>
                <p>Qaydalar</p>
                <p>Məxfilik</p>
            </div>
            <div className="space-y-2 font-light flex flex-col items-start">
                <p className="text-lg font-normal">ƏLAQƏ</p>
                <p>infowisestudy@gmail.com</p>
                <p>+994 055 275 23 05</p>
                <p>Bakı, Azərbaycan</p>
            </div>
        </footer>
    )
}

