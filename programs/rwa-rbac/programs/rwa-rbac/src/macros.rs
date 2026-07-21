#[macro_export]
macro_rules! controller_seeds {
    ($controller:expr) => {
        &[
            &$controller.key().to_bytes()[..],
            &[$controller.controller_authority_bump][..],
        ]
    };
}
